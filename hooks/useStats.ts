import { useState, useEffect, useCallback } from 'react';
import type { Difficulty } from '../src/types/game';
import { loadStats, recordGame, type GameStats, type DifficultyStats } from '../services/storage';

const DEFAULT_STATS: GameStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
  difficultyStats: {
    easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
    normal: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
    hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
  },
};

export type DifficultyRecommendation = 'up' | 'down' | null;

function getRecommendation(ds: DifficultyStats, currentDifficulty: Difficulty): DifficultyRecommendation {
  if (ds.gamesPlayed < 5) return null;

  const winRate = ds.gamesWon / ds.gamesPlayed;
  const avgGuesses = ds.gamesWon > 0 ? ds.totalGuesses / ds.gamesWon : Infinity;

  if (winRate >= 0.8 && avgGuesses <= 3.5 && currentDifficulty !== 'hard') {
    return 'up';
  }
  if (winRate < 0.3 && currentDifficulty !== 'easy') {
    return 'down';
  }
  return null;
}

export function useStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  useEffect(() => {
    loadStats().then(setStats);
  }, []);

  const record = useCallback(async (won: boolean, guessCount: number, difficulty: Difficulty = 'normal') => {
    const updated = await recordGame(won, guessCount, difficulty);
    setStats(updated);
    return updated;
  }, []);

  const winRate = stats.totalPlayed > 0
    ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
    : 0;

  const getDifficultyRecommendation = useCallback((difficulty: Difficulty): DifficultyRecommendation => {
    return getRecommendation(stats.difficultyStats[difficulty], difficulty);
  }, [stats]);

  return { stats, record, winRate, getDifficultyRecommendation };
}
