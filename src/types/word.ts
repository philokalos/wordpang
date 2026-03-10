export type WordCategory = 'animal' | 'food' | 'school' | 'nature' | 'body' | 'home' | 'action' | 'feeling';

export interface WordEntry {
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  category: WordCategory;
  partOfSpeech: string;
}
