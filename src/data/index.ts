import type { Difficulty } from '../types/game';
import type { WordEntry, WordCategory } from '../types/word';
import { EASY_ANSWER_LIST, EASY_VALID_WORDS } from './words-easy';
import { NORMAL_ANSWER_LIST, NORMAL_VALID_WORDS } from './words-normal';
import { HARD_ANSWER_LIST, HARD_VALID_WORDS } from './words-hard';

interface WordList {
  answers: WordEntry[];
  validWords: Set<string>;
}

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

export function getWordListByCategory(
  difficulty: Difficulty,
  category?: WordCategory,
): WordList {
  const list = getWordList(difficulty);
  if (!category) return list;
  return {
    answers: list.answers.filter((w) => w.category === category),
    validWords: list.validWords,
  };
}

export function getRandomWord(difficulty: Difficulty, category?: WordCategory): WordEntry {
  const { answers } = category
    ? getWordListByCategory(difficulty, category)
    : getWordList(difficulty);
  const index = Math.floor(Math.random() * answers.length);
  return answers[index]!;
}
