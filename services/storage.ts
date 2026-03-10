import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LearnedWord } from '../src/types/learned';
import type { ReviewEntry } from '../src/types/review';
import type { Achievement } from '../src/types/achievement';
import type { Difficulty } from '../src/types/game';
import type { WordCategory } from '../src/types/word';

const KEYS = {
  stats: 'wordpop_stats',
  dailyState: 'wordpop_daily_state',
  learnedWords: 'wordpop_learned_words',
  reviewEntries: 'wordpop_review_entries',
  achievements: 'wordpop_achievements',
  playedCategories: 'wordpop_played_categories',
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

export async function loadStats(): Promise<GameStats> {
  const raw = await AsyncStorage.getItem(KEYS.stats);
  if (!raw) return { ...DEFAULT_STATS, difficultyStats: { easy: { ...DEFAULT_DIFFICULTY_STATS }, normal: { ...DEFAULT_DIFFICULTY_STATS }, hard: { ...DEFAULT_DIFFICULTY_STATS } } };
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
}

export async function saveStats(stats: GameStats): Promise<void> {
  await AsyncStorage.setItem(KEYS.stats, JSON.stringify(stats));
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
  const raw = await AsyncStorage.getItem(KEYS.dailyState);
  if (!raw) return null;
  return JSON.parse(raw) as DailyState;
}

export async function saveDailyState(state: DailyState): Promise<void> {
  await AsyncStorage.setItem(KEYS.dailyState, JSON.stringify(state));
}

// Learned words
export async function loadLearnedWords(): Promise<LearnedWord[]> {
  const raw = await AsyncStorage.getItem(KEYS.learnedWords);
  if (!raw) return [];
  return JSON.parse(raw) as LearnedWord[];
}

export async function markWordLearned(word: string): Promise<LearnedWord[]> {
  const words = await loadLearnedWords();
  const existing = words.find((w) => w.word === word);
  if (existing) {
    existing.timesCorrect += 1;
  } else {
    words.push({ word, firstSeen: Date.now(), timesCorrect: 1 });
  }
  await AsyncStorage.setItem(KEYS.learnedWords, JSON.stringify(words));
  return words;
}

// Review entries
export async function loadReviewEntries(): Promise<ReviewEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.reviewEntries);
  if (!raw) return [];
  return JSON.parse(raw) as ReviewEntry[];
}

export async function saveReviewEntry(entry: ReviewEntry): Promise<void> {
  const entries = await loadReviewEntries();
  const idx = entries.findIndex((e) => e.word === entry.word);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  await AsyncStorage.setItem(KEYS.reviewEntries, JSON.stringify(entries));
}

// Achievements
export async function loadAchievements(): Promise<Achievement[]> {
  const raw = await AsyncStorage.getItem(KEYS.achievements);
  if (!raw) return [];
  return JSON.parse(raw) as Achievement[];
}

export async function saveAchievements(achievements: Achievement[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.achievements, JSON.stringify(achievements));
}

// Played categories tracking
export async function loadPlayedCategories(): Promise<WordCategory[]> {
  const raw = await AsyncStorage.getItem(KEYS.playedCategories);
  if (!raw) return [];
  return JSON.parse(raw) as WordCategory[];
}

export async function addPlayedCategory(category: WordCategory): Promise<WordCategory[]> {
  const cats = await loadPlayedCategories();
  if (!cats.includes(category)) {
    cats.push(category);
    await AsyncStorage.setItem(KEYS.playedCategories, JSON.stringify(cats));
  }
  return cats;
}
