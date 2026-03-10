import { useState, useEffect, useCallback } from 'react';
import { loadStats, recordGame, type GameStats } from '../services/storage';

const DEFAULT_STATS: GameStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
};

export function useStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  useEffect(() => {
    loadStats().then(setStats);
  }, []);

  const record = useCallback(async (won: boolean, guessCount: number) => {
    const updated = await recordGame(won, guessCount);
    setStats(updated);
  }, []);

  const winRate = stats.totalPlayed > 0
    ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
    : 0;

  return { stats, record, winRate };
}
