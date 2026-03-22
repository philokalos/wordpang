import {
  evaluateGuess,
  isValidWord,
  updateKeyStatuses,
  generateHint,
  findRhymingWord,
  generateWordFamilyPattern,
} from '../lib/game-logic';
import { HINT_COSTS } from '../types/game';
import type { LetterStatus } from '../types/game';
import type { WordEntry } from '../types/word';

describe('evaluateGuess', () => {
  it('should mark all correct for exact match', () => {
    expect(evaluateGuess('APPLE', 'APPLE')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('should mark all absent for no match', () => {
    expect(evaluateGuess('XXXYZ', 'APPLE')).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });

  it('should mark present for letters in wrong position', () => {
    expect(evaluateGuess('ELPPA', 'APPLE')).toEqual([
      'present', 'present', 'correct', 'present', 'present',
    ]);
  });

  it('should handle duplicate letters correctly — one correct, one absent', () => {
    const result = evaluateGuess('PAPER', 'APPLE');
    expect(result).toEqual(['present', 'present', 'correct', 'present', 'absent']);
  });

  it('should not over-count present letters', () => {
    const result = evaluateGuess('LLAMA', 'HELLO');
    expect(result).toEqual(['present', 'present', 'absent', 'absent', 'absent']);
  });

  it('should handle correct taking precedence over present for duplicates', () => {
    const result = evaluateGuess('ROBOT', 'BOOKS');
    expect(result).toEqual(['absent', 'correct', 'present', 'present', 'absent']);
  });

  it('should work with 4-letter words', () => {
    expect(evaluateGuess('BEAR', 'BEAR')).toEqual([
      'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('should work with 6-letter words', () => {
    expect(evaluateGuess('CASTLE', 'CASTLE')).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('should handle single duplicate in guess, single in target', () => {
    const result = evaluateGuess('CREEP', 'CRANE');
    expect(result).toEqual(['correct', 'correct', 'present', 'absent', 'absent']);
  });
});

describe('isValidWord', () => {
  const validWords = new Set(['APPLE', 'HELLO', 'WORLD']);

  it('should return true for valid word', () => {
    expect(isValidWord('APPLE', validWords)).toBe(true);
  });

  it('should return true case-insensitively', () => {
    expect(isValidWord('apple', validWords)).toBe(true);
  });

  it('should return false for invalid word', () => {
    expect(isValidWord('ZZZZZ', validWords)).toBe(false);
  });
});

describe('updateKeyStatuses', () => {
  it('should add new statuses', () => {
    const current = new Map<string, LetterStatus>();
    const result = updateKeyStatuses(current, 'AB', ['correct', 'absent']);
    expect(result.get('A')).toBe('correct');
    expect(result.get('B')).toBe('absent');
  });

  it('should not downgrade from correct to present', () => {
    const current = new Map<string, LetterStatus>([['A', 'correct']]);
    const result = updateKeyStatuses(current, 'A', ['present']);
    expect(result.get('A')).toBe('correct');
  });

  it('should upgrade from absent to present', () => {
    const current = new Map<string, LetterStatus>([['A', 'absent']]);
    const result = updateKeyStatuses(current, 'A', ['present']);
    expect(result.get('A')).toBe('present');
  });

  it('should upgrade from present to correct', () => {
    const current = new Map<string, LetterStatus>([['A', 'present']]);
    const result = updateKeyStatuses(current, 'A', ['correct']);
    expect(result.get('A')).toBe('correct');
  });
});

describe('generateHint', () => {
  const wordEntry = {
    word: 'APPLE',
    meaning: '사과',
    pronunciation: '애플',
    example: 'I eat an apple every day.',
    category: 'food' as const,
    partOfSpeech: 'noun',
  };

  it('should generate example hint with word blanked', () => {
    expect(generateHint(wordEntry, 'example')).toBe('예문: I eat an _____ every day.');
  });

  it('should generate first letter hint', () => {
    expect(generateHint(wordEntry, 'firstLetter')).toBe('첫 글자: A');
  });

  it('should generate vowel count hint', () => {
    expect(generateHint(wordEntry, 'vowelCount')).toBe('모음 수: 2개');
  });

  it('should count vowels correctly for consonant-heavy word', () => {
    const word = { word: 'RHYTHM', meaning: '리듬', pronunciation: '리듬', example: 'Feel the rhythm.', category: 'school' as const, partOfSpeech: 'noun' };
    expect(generateHint(word, 'vowelCount')).toBe('모음 수: 0개');
  });
});

// ============================================================
// DDD Tests for NEW hint types: rhyming, wordFamily
// ============================================================

const testWord: WordEntry = {
  word: 'CAKE',
  meaning: '케이크',
  pronunciation: '케이크',
  example: 'I love chocolate cake.',
  category: 'food',
  partOfSpeech: 'noun',
};

// --------------------------------------------------
// 1. Domain Model Tests — HINT_COSTS
// --------------------------------------------------
describe('HINT_COSTS — 새로운 힌트 타입 비용', () => {
  it('rhyming 비용은 1이어야 한다', () => {
    expect(HINT_COSTS.rhyming).toBe(1);
  });

  it('wordFamily 비용은 2이어야 한다', () => {
    expect(HINT_COSTS.wordFamily).toBe(2);
  });
});

// --------------------------------------------------
// 2. Domain Logic Tests — generateHint for new types
// --------------------------------------------------
describe('generateHint — rhyming 힌트', () => {
  it('같은 끝글자를 가진 라이밍 단어를 찾아야 한다', () => {
    const validWords = new Set(['CAKE', 'MAKE', 'LAKE', 'BIKE', 'JUMP']);
    const result = generateHint(testWord, 'rhyming', undefined, validWords);
    // Should find a word ending in "AKE" (3-letter match preferred) or "KE" (2-letter)
    expect(result).toMatch(/라이밍: (MAKE|LAKE) 와 비슷한 끝소리/);
  });

  it('라이밍 단어가 없으면 끝글자 패턴 힌트를 반환해야 한다', () => {
    const validWords = new Set(['CAKE', 'JUMP', 'BIRD', 'FISH']);
    const result = generateHint(testWord, 'rhyming', undefined, validWords);
    expect(result).toBe('라이밍: ...KE 로 끝나요');
  });

  it('validWords가 비어있으면 fallback 힌트를 반환해야 한다', () => {
    const validWords = new Set<string>();
    const result = generateHint(testWord, 'rhyming', undefined, validWords);
    expect(result).toBe('라이밍: ...KE 로 끝나요');
  });
});

describe('generateHint — wordFamily 힌트', () => {
  it('모음은 보여주고 자음은 숨겨야 한다 (CAKE → _A_E)', () => {
    const result = generateHint(testWord, 'wordFamily');
    expect(result).toBe('단어 패턴: _A_E');
  });

  it('모음만 있는 단어를 처리해야 한다', () => {
    const vowelWord: WordEntry = {
      word: 'AIOU',
      meaning: '테스트',
      pronunciation: '테스트',
      example: 'Test word.',
      category: 'school',
      partOfSpeech: 'noun',
    };
    const result = generateHint(vowelWord, 'wordFamily');
    expect(result).toBe('단어 패턴: AIOU');
  });

  it('자음만 있는 단어를 처리해야 한다', () => {
    const consonantWord: WordEntry = {
      word: 'RHYTHM',
      meaning: '리듬',
      pronunciation: '리듬',
      example: 'Feel the rhythm.',
      category: 'school',
      partOfSpeech: 'noun',
    };
    const result = generateHint(consonantWord, 'wordFamily');
    expect(result).toBe('단어 패턴: ______');
  });
});

// --------------------------------------------------
// 3. Helper Function Tests
// --------------------------------------------------
describe('findRhymingWord — 라이밍 단어 검색', () => {
  it('같은 길이에서 2글자 이상 suffix가 일치하는 단어를 찾아야 한다', () => {
    const validWords = new Set(['MAKE', 'LAKE', 'BIKE', 'JUMP']);
    const result = findRhymingWord('CAKE', validWords);
    expect(result).not.toBeNull();
    expect(['MAKE', 'LAKE']).toContain(result);
  });

  it('3글자 suffix 매치를 우선해야 한다', () => {
    const validWords = new Set(['BAKE', 'DUKE']); // BAKE has 3-letter "AKE" match, DUKE has 2-letter "KE"
    const result = findRhymingWord('CAKE', validWords);
    expect(result).toBe('BAKE');
  });

  it('라이밍 단어가 없으면 null을 반환해야 한다', () => {
    const validWords = new Set(['JUMP', 'BIRD', 'FISH']);
    const result = findRhymingWord('CAKE', validWords);
    expect(result).toBeNull();
  });

  it('자기 자신은 제외해야 한다', () => {
    const validWords = new Set(['CAKE']);
    const result = findRhymingWord('CAKE', validWords);
    expect(result).toBeNull();
  });

  it('validWords가 undefined이면 null을 반환해야 한다', () => {
    const result = findRhymingWord('CAKE', undefined);
    expect(result).toBeNull();
  });

  it('다른 길이의 단어는 무시해야 한다', () => {
    const validWords = new Set(['SHAKE', 'BRAKE']); // 5-letter words, CAKE is 4
    const result = findRhymingWord('CAKE', validWords);
    expect(result).toBeNull();
  });
});

describe('generateWordFamilyPattern — 단어 패턴 생성', () => {
  it('CAKE → _A_E (모음 표시, 자음 숨김)', () => {
    expect(generateWordFamilyPattern('CAKE')).toBe('_A_E');
  });

  it('APPLE → A___E', () => {
    expect(generateWordFamilyPattern('APPLE')).toBe('A___E');
  });

  it('HELLO → _E__O', () => {
    expect(generateWordFamilyPattern('HELLO')).toBe('_E__O');
  });

  it('모음만 있는 단어는 전부 표시', () => {
    expect(generateWordFamilyPattern('AIOE')).toBe('AIOE');
  });

  it('자음만 있는 단어는 전부 숨김', () => {
    expect(generateWordFamilyPattern('BCDFG')).toBe('_____');
  });

  it('한 글자 모음 단어', () => {
    expect(generateWordFamilyPattern('A')).toBe('A');
  });

  it('한 글자 자음 단어', () => {
    expect(generateWordFamilyPattern('B')).toBe('_');
  });
});

// --------------------------------------------------
// 4. Edge Cases
// --------------------------------------------------
describe('generateHint — 엣지 케이스', () => {
  it('rhyming에 validWords 파라미터 없이 호출하면 fallback 반환', () => {
    const result = generateHint(testWord, 'rhyming');
    expect(result).toBe('라이밍: ...KE 로 끝나요');
  });

  it('rhyming에 빈 validWords Set으로 호출하면 fallback 반환', () => {
    const result = generateHint(testWord, 'rhyming', undefined, new Set<string>());
    expect(result).toBe('라이밍: ...KE 로 끝나요');
  });

  it('짧은 단어(2글자)의 rhyming fallback은 마지막 2글자 표시', () => {
    const shortWord: WordEntry = {
      word: 'GO',
      meaning: '가다',
      pronunciation: '고',
      example: 'Let us go.',
      category: 'action',
      partOfSpeech: 'verb',
    };
    const result = generateHint(shortWord, 'rhyming');
    expect(result).toBe('라이밍: ...GO 로 끝나요');
  });

  it('wordFamily로 5글자 단어 패턴 생성', () => {
    const fiveLetterWord: WordEntry = {
      word: 'TIGER',
      meaning: '호랑이',
      pronunciation: '타이거',
      example: 'The tiger is strong.',
      category: 'animal',
      partOfSpeech: 'noun',
    };
    const result = generateHint(fiveLetterWord, 'wordFamily');
    expect(result).toBe('단어 패턴: _I_E_');
  });
});
