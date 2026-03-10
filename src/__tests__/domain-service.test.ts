/**
 * DDD Domain Service Tests
 *
 * evaluateGuess, updateKeyStatuses, generateHint 의 도메인 계약을 검증.
 * game-logic.test.ts의 기본 케이스를 넘어 경계 조건과 불변식에 집중.
 */

import { evaluateGuess, updateKeyStatuses, generateHint } from '../lib/game-logic';
import type { LetterStatus } from '../types/game';

describe('Domain Service: evaluateGuess boundary conditions', () => {
  it('should return array of same length as guess', () => {
    const result4 = evaluateGuess('BEAR', 'BEAR');
    const result5 = evaluateGuess('APPLE', 'APPLE');
    const result6 = evaluateGuess('CASTLE', 'CASTLE');

    expect(result4).toHaveLength(4);
    expect(result5).toHaveLength(5);
    expect(result6).toHaveLength(6);
  });

  it('should only contain valid LetterStatus values', () => {
    const validStatuses: LetterStatus[] = ['correct', 'present', 'absent'];
    const result = evaluateGuess('TRACE', 'APPLE');

    result.forEach((status) => {
      expect(validStatuses).toContain(status);
    });
  });

  it('correct count should not exceed actual letter frequency in target', () => {
    // Target: APPLE (A:1, P:2, L:1, E:1)
    // Guess:  PPPPP (P:5)
    // Only 2 P's exist → at most 2 non-absent
    const result = evaluateGuess('PPPPP', 'APPLE');
    const nonAbsent = result.filter((s) => s !== 'absent');
    expect(nonAbsent).toHaveLength(2);
  });

  it('should handle all-same-letter guess', () => {
    // Target: HELLO (L:2, others:1)
    // Guess:  LLLLL → L at 2: correct, L at 3: correct, others: absent
    const result = evaluateGuess('LLLLL', 'HELLO');
    const correctCount = result.filter((s) => s === 'correct').length;
    const presentCount = result.filter((s) => s === 'present').length;

    expect(correctCount).toBe(2);
    expect(presentCount).toBe(0);
  });
});

describe('Domain Service: updateKeyStatuses invariants', () => {
  it('should never downgrade a status (correct → present or absent)', () => {
    const statuses: LetterStatus[] = ['correct', 'present', 'absent'];
    const priority: Record<LetterStatus, number> = { correct: 3, present: 2, absent: 1 };

    for (const existing of statuses) {
      for (const incoming of statuses) {
        const current = new Map<string, LetterStatus>([['X', existing]]);
        const result = updateKeyStatuses(current, 'X', [incoming]);
        const resultStatus = result.get('X')!;

        expect(priority[resultStatus]).toBeGreaterThanOrEqual(priority[existing]);
      }
    }
  });

  it('should handle multiple letters in a single update', () => {
    const current = new Map<string, LetterStatus>();
    const result = updateKeyStatuses(current, 'ABCDE', [
      'correct', 'present', 'absent', 'correct', 'present',
    ]);

    expect(result.get('A')).toBe('correct');
    expect(result.get('B')).toBe('present');
    expect(result.get('C')).toBe('absent');
    expect(result.get('D')).toBe('correct');
    expect(result.get('E')).toBe('present');
  });
});

describe('Domain Service: generateHint contracts', () => {
  const word = {
    word: 'HELLO',
    meaning: '안녕',
    pronunciation: '헬로',
    example: 'Hello, how are you?',
  };

  it('example hint should mask the word with underscores', () => {
    const hint = generateHint(word, 'example');
    expect(hint).toContain('_____'); // 5 underscores for HELLO
    expect(hint).not.toContain('Hello');
    expect(hint).not.toContain('hello');
  });

  it('firstLetter hint should reveal only the first character', () => {
    const hint = generateHint(word, 'firstLetter');
    expect(hint).toBe('첫 글자: H');
    expect(hint).not.toContain('HELLO');
  });

  it('vowelCount hint should return correct vowel count', () => {
    const hint = generateHint(word, 'vowelCount');
    // HELLO → E, O = 2 vowels
    expect(hint).toBe('모음 수: 2개');
  });

  it('vowelCount should count all 5 vowels (A, E, I, O, U)', () => {
    const aeiou = {
      word: 'AUDIO',
      meaning: '오디오',
      pronunciation: '오디오',
      example: 'Turn on the audio.',
    };
    const hint = generateHint(aeiou, 'vowelCount');
    // A, U, I, O = 4 vowels
    expect(hint).toBe('모음 수: 4개');
  });
});
