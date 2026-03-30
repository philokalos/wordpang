import { getWordList } from '../src/data';
import type { WordEntry } from '../src/types/word';

export function findWordEntry(word: string): WordEntry | undefined {
  for (const diff of ['easy', 'normal', 'hard'] as const) {
    const { answers } = getWordList(diff);
    const found = answers.find((a) => a.word === word);
    if (found) return found;
  }
  return undefined;
}
