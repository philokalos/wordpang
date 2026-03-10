import { useState, useEffect, useCallback } from 'react';
import type { ReviewEntry } from '../src/types/review';
import { loadReviewEntries, saveReviewEntry } from '../services/storage';
import { calculateNextReview, createReviewEntry, getDueWords } from '../services/spaced-repetition';

export function useReview() {
  const [entries, setEntries] = useState<ReviewEntry[]>([]);
  const [dueWords, setDueWords] = useState<ReviewEntry[]>([]);

  const refresh = useCallback(async () => {
    const loaded = await loadReviewEntries();
    setEntries(loaded);
    setDueWords(getDueWords(loaded));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addWord = useCallback(async (word: string) => {
    const existing = entries.find((e) => e.word === word);
    if (existing) return;
    const entry = createReviewEntry(word);
    await saveReviewEntry(entry);
    await refresh();
  }, [entries, refresh]);

  const markReviewed = useCallback(async (word: string) => {
    const entry = entries.find((e) => e.word === word);
    if (!entry) return;
    const updated = calculateNextReview(entry);
    await saveReviewEntry(updated);
    await refresh();
  }, [entries, refresh]);

  return {
    entries,
    dueWords,
    dueCount: dueWords.length,
    totalCount: entries.length,
    addWord,
    markReviewed,
    refresh,
  };
}
