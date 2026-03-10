import { useState, useCallback } from 'react';
import type { ReviewEntry } from '../src/types/review';
import type { WordEntry } from '../src/types/word';
import { getWordList } from '../src/data';
import type { Difficulty } from '../src/types/game';

interface PracticeResult {
  word: string;
  correct: boolean;
  guessCount: number;
}

export function usePracticeSession(dueWords: ReviewEntry[], difficulty: Difficulty) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const sessionWords = dueWords.slice(0, 5);
  const totalWords = sessionWords.length;
  const currentWord = sessionWords[currentIndex];

  const findWordEntry = useCallback((word: string): WordEntry | undefined => {
    const { answers } = getWordList(difficulty);
    return answers.find((a) => a.word === word);
  }, [difficulty]);

  const recordResult = useCallback((word: string, correct: boolean, guessCount: number) => {
    setResults((prev) => [...prev, { word, correct, guessCount }]);

    if (currentIndex + 1 >= totalWords) {
      setIsComplete(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalWords]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setIsComplete(false);
  }, []);

  const correctCount = results.filter((r) => r.correct).length;

  return {
    currentWord,
    currentIndex,
    totalWords,
    results,
    isComplete,
    correctCount,
    findWordEntry,
    recordResult,
    reset,
  };
}
