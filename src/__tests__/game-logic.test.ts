import {
  evaluateGuess,
  isValidWord,
  updateKeyStatuses,
  generateHint,
} from '../lib/game-logic';
import type { LetterStatus } from '../types/game';

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
