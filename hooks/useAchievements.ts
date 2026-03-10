import { useState, useEffect, useCallback } from 'react';
import type { Achievement } from '../src/types/achievement';
import type { GameStats } from '../services/storage';
import type { Difficulty } from '../src/types/game';
import type { WordCategory } from '../src/types/word';
import { checkAchievements, getAllAchievements } from '../services/achievements';
import { loadPlayedCategories, addPlayedCategory } from '../services/storage';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newUnlocked, setNewUnlocked] = useState<Achievement[]>([]);
  const [playedCategories, setPlayedCategories] = useState<WordCategory[]>([]);

  useEffect(() => {
    getAllAchievements().then(setAchievements);
    loadPlayedCategories().then(setPlayedCategories);
  }, []);

  const trackCategory = useCallback(async (category: WordCategory) => {
    const updated = await addPlayedCategory(category);
    setPlayedCategories(updated);
  }, []);

  const check = useCallback(async (params: {
    stats: GameStats;
    learnedCount: number;
    reviewCount: number;
    lastGameWon: boolean;
    lastGuessCount: number;
    lastHintsUsed: number;
    lastDifficulty: Difficulty;
    isDaily: boolean;
  }) => {
    const unlocked = await checkAchievements({
      ...params,
      playedCategories,
    });
    if (unlocked.length > 0) {
      setNewUnlocked(unlocked);
      const all = await getAllAchievements();
      setAchievements(all);
    }
    return unlocked;
  }, [playedCategories]);

  const dismissNewUnlocked = useCallback(() => {
    setNewUnlocked([]);
  }, []);

  return {
    achievements,
    newUnlocked,
    check,
    dismissNewUnlocked,
    trackCategory,
    unlockedCount: achievements.filter((a) => a.unlockedAt).length,
    totalCount: achievements.length,
  };
}
