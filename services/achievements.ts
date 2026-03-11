import type { Achievement } from '../src/types/achievement';
import { ACHIEVEMENT_DEFS } from '../src/types/achievement';
import type { GameStats } from './storage';
import type { Difficulty } from '../src/types/game';
import type { WordCategory, WordEntry } from '../src/types/word';
import { loadAchievements, saveAchievements } from './storage';

interface CheckContext {
  stats: GameStats;
  learnedCount: number;
  reviewCount: number;
  playedCategories: WordCategory[];
  lastGameWon: boolean;
  lastGuessCount: number;
  lastHintsUsed: number;
  lastDifficulty: Difficulty;
  isDaily: boolean;
  /** Cumulative count of wins achieved in ≤2 guesses */
  speedWinCount?: number;
  /** Cumulative count of wins without using any hints */
  noHintWinCount?: number;
  /** List of learned word strings for category mastery checks */
  learnedWordsList?: string[];
  /** All answer words from all difficulties for category total counts */
  allAnswerWords?: WordEntry[];
  /** Number of consecutive days played (regardless of win/loss) */
  playStreak?: number;
}

const ALL_CATEGORIES: WordCategory[] = ['animal', 'food', 'school', 'nature', 'body', 'home', 'action', 'feeling'];

function checkCategoryMastery(ctx: CheckContext, category: WordCategory): boolean {
  if (!ctx.learnedWordsList || !ctx.allAnswerWords) return false;
  const categoryWords = new Set(
    ctx.allAnswerWords
      .filter((w) => w.category === category)
      .map((w) => w.word),
  );
  if (categoryWords.size === 0) return false;
  const learnedSet = new Set(ctx.learnedWordsList);
  return [...categoryWords].every((word) => learnedSet.has(word));
}

function shouldUnlock(id: string, ctx: CheckContext): boolean {
  switch (id) {
    case 'first_win': return ctx.stats.totalWon >= 1;
    case 'streak_3': return ctx.stats.currentStreak >= 3;
    case 'streak_7': return ctx.stats.currentStreak >= 7;
    case 'streak_30': return ctx.stats.currentStreak >= 30;
    case 'words_10': return ctx.learnedCount >= 10;
    case 'words_50': return ctx.learnedCount >= 50;
    case 'words_100': return ctx.learnedCount >= 100;
    case 'perfect_guess': return ctx.lastGameWon && ctx.lastGuessCount === 1;
    case 'all_categories': return ALL_CATEGORIES.every((c) => ctx.playedCategories.includes(c));
    case 'review_10': return ctx.reviewCount >= 10;
    case 'games_10': return ctx.stats.totalPlayed >= 10;
    case 'games_50': return ctx.stats.totalPlayed >= 50;
    case 'no_hints': return ctx.lastGameWon && ctx.lastHintsUsed === 0;
    case 'hard_win': return ctx.lastGameWon && ctx.lastDifficulty === 'hard';
    case 'daily_first': return ctx.isDaily && ctx.lastGameWon;
    case 'speed_learner': {
      // Count from guessDistribution (keys 1 and 2) or use provided cumulative count
      const speedCount = ctx.speedWinCount
        ?? (ctx.stats.guessDistribution[1] ?? 0) + (ctx.stats.guessDistribution[2] ?? 0);
      return speedCount >= 5;
    }
    case 'no_hints_10': return (ctx.noHintWinCount ?? 0) >= 10;
    case 'category_master_animal': return checkCategoryMastery(ctx, 'animal');
    case 'category_master_food': return checkCategoryMastery(ctx, 'food');
    case 'consistency': return (ctx.playStreak ?? ctx.stats.currentStreak) >= 7;
    case 'review_expert': return ctx.reviewCount >= 30;
    default: return false;
  }
}

export async function checkAchievements(ctx: CheckContext): Promise<Achievement[]> {
  const existing = await loadAchievements();
  const unlockedIds = new Set(existing.filter((a) => a.unlockedAt).map((a) => a.id));
  const newlyUnlocked: Achievement[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (unlockedIds.has(def.id)) continue;
    if (shouldUnlock(def.id, ctx)) {
      newlyUnlocked.push({ ...def, unlockedAt: Date.now() });
    }
  }

  if (newlyUnlocked.length > 0) {
    const all = [...existing, ...newlyUnlocked];
    await saveAchievements(all);
  }

  return newlyUnlocked;
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const unlocked = await loadAchievements();
  const unlockedMap = new Map(unlocked.map((a) => [a.id, a]));

  return ACHIEVEMENT_DEFS.map((def) => {
    const existing = unlockedMap.get(def.id);
    return existing ?? { ...def };
  });
}
