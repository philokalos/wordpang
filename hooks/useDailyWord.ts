import { useState, useEffect, useCallback } from 'react';
import type { Difficulty } from '../src/types/game';
import type { WordEntry } from '../src/types/word';
import { getDailyWord, getTodayString, getTimeUntilMidnight } from '../services/daily-word';
import { loadDailyState, saveDailyState, type DailyState } from '../services/storage';

interface UseDailyWordReturn {
  dailyWord: WordEntry;
  dailyCompleted: boolean;
  dailyWon: boolean;
  countdown: string;
  markDailyComplete: (won: boolean, guesses: string[]) => Promise<void>;
}

export function useDailyWord(difficulty: Difficulty): UseDailyWordReturn {
  const [dailyWord] = useState(() => getDailyWord(difficulty));
  const [dailyState, setDailyState] = useState<DailyState | null>(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    loadDailyState().then((state) => {
      const today = getTodayString();
      if (state?.date === today) {
        setDailyState(state);
      }
    });
  }, []);

  useEffect(() => {
    if (!dailyState?.completed) return;

    const interval = setInterval(() => {
      const { hours, minutes, seconds } = getTimeUntilMidnight();
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [dailyState?.completed]);

  const markDailyComplete = useCallback(async (won: boolean, guesses: string[]) => {
    const state: DailyState = {
      date: getTodayString(),
      completed: true,
      won,
      guesses,
    };
    await saveDailyState(state);
    setDailyState(state);
  }, []);

  return {
    dailyWord,
    dailyCompleted: dailyState?.completed ?? false,
    dailyWon: dailyState?.won ?? false,
    countdown,
    markDailyComplete,
  };
}
