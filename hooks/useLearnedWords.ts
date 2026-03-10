import { useState, useEffect, useCallback } from 'react';
import type { LearnedWord } from '../src/types/learned';
import { loadLearnedWords, markWordLearned } from '../services/storage';

export function useLearnedWords() {
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);

  useEffect(() => {
    loadLearnedWords().then(setLearnedWords);
  }, []);

  const markLearned = useCallback(async (word: string) => {
    const updated = await markWordLearned(word);
    setLearnedWords(updated);
  }, []);

  return { learnedWords, markLearned, learnedCount: learnedWords.length };
}
