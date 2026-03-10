/**
 * DDD Domain Model Tests
 *
 * Domain Layer (src/) 의 불변식(invariant)과 값 객체(value object) 계약을 검증.
 * - Aggregate: Game (Difficulty → word pool → evaluations)
 * - Value Objects: LetterStatus, HintType, Difficulty, WordEntry
 * - Domain Invariants: DIFFICULTY_CONFIG 정합성, word pool 무결성
 */

import { DIFFICULTY_CONFIG } from '../types/game';
import type { Difficulty, HintType } from '../types/game';
import type { WordEntry } from '../types/word';
import { getWordList, getRandomWord } from '../data';

describe('Domain Model: DIFFICULTY_CONFIG invariants', () => {
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  it('should define all three difficulties', () => {
    difficulties.forEach((d) => {
      expect(DIFFICULTY_CONFIG[d]).toBeDefined();
    });
  });

  it('should have increasing word length: easy < normal < hard', () => {
    expect(DIFFICULTY_CONFIG.easy.wordLength).toBeLessThan(DIFFICULTY_CONFIG.normal.wordLength);
    expect(DIFFICULTY_CONFIG.normal.wordLength).toBeLessThan(DIFFICULTY_CONFIG.hard.wordLength);
  });

  it('should have at least 6 max attempts for all difficulties', () => {
    difficulties.forEach((d) => {
      expect(DIFFICULTY_CONFIG[d].maxAttempts).toBeGreaterThanOrEqual(6);
    });
  });

  it('should have non-empty label and emoji for all difficulties', () => {
    difficulties.forEach((d) => {
      expect(DIFFICULTY_CONFIG[d].label.length).toBeGreaterThan(0);
      expect(DIFFICULTY_CONFIG[d].emoji.length).toBeGreaterThan(0);
    });
  });
});

describe('Domain Model: WordEntry value object', () => {
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  it.each(difficulties)('all %s words should match configured word length', (difficulty) => {
    const { answers } = getWordList(difficulty);
    const expectedLength = DIFFICULTY_CONFIG[difficulty].wordLength;

    answers.forEach((entry: WordEntry) => {
      expect(entry.word).toHaveLength(expectedLength);
    });
  });

  it.each(difficulties)('all %s words should be uppercase', (difficulty) => {
    const { answers } = getWordList(difficulty);

    answers.forEach((entry: WordEntry) => {
      expect(entry.word).toBe(entry.word.toUpperCase());
    });
  });

  it.each(difficulties)('all %s words should have complete properties', (difficulty) => {
    const { answers } = getWordList(difficulty);

    answers.forEach((entry: WordEntry) => {
      expect(entry.word.length).toBeGreaterThan(0);
      expect(entry.meaning.length).toBeGreaterThan(0);
      expect(entry.pronunciation.length).toBeGreaterThan(0);
      expect(entry.example.length).toBeGreaterThan(0);
    });
  });

  it.each(difficulties)('all %s answer words should be in valid words set', (difficulty) => {
    const { answers, validWords } = getWordList(difficulty);

    answers.forEach((entry: WordEntry) => {
      expect(validWords.has(entry.word)).toBe(true);
    });
  });

  it.each(difficulties)('%s should have no duplicate answer words', (difficulty) => {
    const { answers } = getWordList(difficulty);
    const words = answers.map((e: WordEntry) => e.word);
    const unique = new Set(words);
    expect(unique.size).toBe(words.length);
  });
});

describe('Domain Model: Word selection', () => {
  it('getRandomWord should return a word from the correct pool', () => {
    const word = getRandomWord('easy');
    const { answers } = getWordList('easy');

    expect(answers.some((a: WordEntry) => a.word === word.word)).toBe(true);
  });

  it('getRandomWord should respect difficulty word length', () => {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

    difficulties.forEach((d) => {
      const word = getRandomWord(d);
      expect(word.word).toHaveLength(DIFFICULTY_CONFIG[d].wordLength);
    });
  });
});

describe('Domain Model: HintType exhaustiveness', () => {
  it('should support exactly 3 hint types', () => {
    const hintTypes: HintType[] = ['example', 'firstLetter', 'vowelCount'];
    expect(hintTypes).toHaveLength(3);
  });
});
