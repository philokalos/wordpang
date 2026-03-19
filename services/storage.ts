import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LearnedWord } from '../src/types/learned';
import type { ReviewEntry } from '../src/types/review';
import type { Achievement } from '../src/types/achievement';
import type { Difficulty } from '../src/types/game';
import type { WordCategory } from '../src/types/word';

// Migrate from wordpop_ keys to wordpang_ keys
const OLD_PREFIX = 'wordpop_';
const NEW_PREFIX = 'wordpang_';

export async function migrateStorageKeys(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const oldKeys = allKeys.filter((k) => k.startsWith(OLD_PREFIX));
  if (oldKeys.length === 0) return;

  for (const oldKey of oldKeys) {
    const newKey = oldKey.replace(OLD_PREFIX, NEW_PREFIX);
    const existing = await AsyncStorage.getItem(newKey);
    if (!existing) {
      const value = await AsyncStorage.getItem(oldKey);
      if (value) {
        await AsyncStorage.setItem(newKey, value);
      }
    }
    await AsyncStorage.removeItem(oldKey);
  }
}

const KEYS = {
  stats: 'wordpang_stats',
  dailyState: 'wordpang_daily_state',
  learnedWords: 'wordpang_learned_words',
  reviewEntries: 'wordpang_review_entries',
  achievements: 'wordpang_achievements',
  playedCategories: 'wordpang_played_categories',
} as const;

export interface DifficultyStats {
  gamesPlayed: number;
  gamesWon: number;
  totalGuesses: number;
}

export interface GameStats {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  difficultyStats: Record<Difficulty, DifficultyStats>;
}

export interface DailyState {
  date: string;
  completed: boolean;
  won: boolean;
  guesses: string[];
}

const DEFAULT_DIFFICULTY_STATS: DifficultyStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalGuesses: 0,
};

const DEFAULT_STATS: GameStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
  difficultyStats: {
    easy: { ...DEFAULT_DIFFICULTY_STATS },
    normal: { ...DEFAULT_DIFFICULTY_STATS },
    hard: { ...DEFAULT_DIFFICULTY_STATS },
  },
};

function freshStats(): GameStats {
  return {
    ...DEFAULT_STATS,
    difficultyStats: {
      easy: { ...DEFAULT_DIFFICULTY_STATS },
      normal: { ...DEFAULT_DIFFICULTY_STATS },
      hard: { ...DEFAULT_DIFFICULTY_STATS },
    },
  };
}

export async function loadStats(): Promise<GameStats> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.stats);
    if (!raw) return freshStats();
    const parsed = JSON.parse(raw) as Partial<GameStats>;
    return {
      ...DEFAULT_STATS,
      ...parsed,
      difficultyStats: {
        easy: { ...DEFAULT_DIFFICULTY_STATS, ...parsed.difficultyStats?.easy },
        normal: { ...DEFAULT_DIFFICULTY_STATS, ...parsed.difficultyStats?.normal },
        hard: { ...DEFAULT_DIFFICULTY_STATS, ...parsed.difficultyStats?.hard },
      },
    };
  } catch {
    return freshStats();
  }
}

export async function saveStats(stats: GameStats): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.stats, JSON.stringify(stats));
  } catch {
    // Silently fail — stats will reload defaults next time
  }
}

export async function recordGame(
  won: boolean,
  guessCount: number,
  difficulty: Difficulty = 'normal',
): Promise<GameStats> {
  const stats = await loadStats();
  stats.totalPlayed += 1;

  const ds = stats.difficultyStats[difficulty];
  ds.gamesPlayed += 1;
  ds.totalGuesses += guessCount;

  if (won) {
    stats.totalWon += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] ?? 0) + 1;
    ds.gamesWon += 1;
  } else {
    stats.currentStreak = 0;
  }

  await saveStats(stats);
  return stats;
}

export async function loadDailyState(): Promise<DailyState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.dailyState);
    if (!raw) return null;
    return JSON.parse(raw) as DailyState;
  } catch {
    return null;
  }
}

export async function saveDailyState(state: DailyState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.dailyState, JSON.stringify(state));
  } catch {
    // Silently fail — daily state will reset next session
  }
}

// Learned words
export async function loadLearnedWords(): Promise<LearnedWord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.learnedWords);
    if (!raw) return [];
    return JSON.parse(raw) as LearnedWord[];
  } catch {
    return [];
  }
}

export async function markWordLearned(word: string): Promise<LearnedWord[]> {
  try {
    const words = await loadLearnedWords();
    const existing = words.find((w) => w.word === word);
    if (existing) {
      existing.timesCorrect += 1;
    } else {
      words.push({ word, firstSeen: Date.now(), timesCorrect: 1 });
    }
    await AsyncStorage.setItem(KEYS.learnedWords, JSON.stringify(words));
    return words;
  } catch {
    return [];
  }
}

// Review entries
export async function loadReviewEntries(): Promise<ReviewEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.reviewEntries);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewEntry[];
  } catch {
    return [];
  }
}

export async function saveReviewEntry(entry: ReviewEntry): Promise<void> {
  try {
    const entries = await loadReviewEntries();
    const idx = entries.findIndex((e) => e.word === entry.word);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    await AsyncStorage.setItem(KEYS.reviewEntries, JSON.stringify(entries));
  } catch {
    // Silently fail — review entry will be retried next session
  }
}

// Achievements
export async function loadAchievements(): Promise<Achievement[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.achievements);
    if (!raw) return [];
    return JSON.parse(raw) as Achievement[];
  } catch {
    return [];
  }
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.achievements, JSON.stringify(achievements));
  } catch {
    // Silently fail — achievements will reload defaults next time
  }
}

// Played categories tracking
export async function loadPlayedCategories(): Promise<WordCategory[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.playedCategories);
    if (!raw) return [];
    return JSON.parse(raw) as WordCategory[];
  } catch {
    return [];
  }
}

export async function addPlayedCategory(category: WordCategory): Promise<WordCategory[]> {
  try {
    const cats = await loadPlayedCategories();
    if (!cats.includes(category)) {
      cats.push(category);
      await AsyncStorage.setItem(KEYS.playedCategories, JSON.stringify(cats));
    }
    return cats;
  } catch {
    return [];
  }
}
