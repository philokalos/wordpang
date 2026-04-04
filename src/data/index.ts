import type { Difficulty } from '../types/game';
import type { WordEntry, WordCategory } from '../types/word';
import { EASY_ANSWER_LIST } from './words-easy';
import { NORMAL_ANSWER_LIST } from './words-normal';
import { HARD_ANSWER_LIST } from './words-hard';
import { VALID_WORDS_4 } from './valid-words-4';
import { VALID_WORDS_5 } from './valid-words-5';
import { VALID_WORDS_6 } from './valid-words-6';

interface WordList {
  answers: WordEntry[];
  validWords: Set<string>;
}

// Merge answer words into valid words sets (answers must always be valid guesses)
const EASY_VALID_WORDS = new Set([...VALID_WORDS_4, ...EASY_ANSWER_LIST.map((e) => e.word)]);
const NORMAL_VALID_WORDS = new Set([...VALID_WORDS_5, ...NORMAL_ANSWER_LIST.map((e) => e.word)]);
const HARD_VALID_WORDS = new Set([...VALID_WORDS_6, ...HARD_ANSWER_LIST.map((e) => e.word)]);

export function getWordList(difficulty: Difficulty): WordList {
  switch (difficulty) {
    case 'easy':
      return { answers: EASY_ANSWER_LIST, validWords: EASY_VALID_WORDS };
    case 'normal':
      return { answers: NORMAL_ANSWER_LIST, validWords: NORMAL_VALID_WORDS };
    case 'hard':
      return { answers: HARD_ANSWER_LIST, validWords: HARD_VALID_WORDS };
  }
}

// Function removed to avoid mysterious bundling ReferenceError. Use inline filtering instead.

export function getRandomWord(difficulty: Difficulty, category?: WordCategory): WordEntry {
  const { answers } = getWordList(difficulty);
  const filtered = category 
    ? answers.filter(w => w.category === category)
    : answers;

  if (filtered.length === 0) {
    // If category filtering results in zero words, fallback to any word of this difficulty
    const index = Math.floor(Math.random() * answers.length);
    return answers[index]!;
  }

  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index]!;
}
