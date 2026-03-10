import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  stats: 'wordle_stats',
  dailyState: 'wordle_daily_state',
} as const;

export interface GameStats {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
}

export interface DailyState {
  date: string;
  completed: boolean;
  won: boolean;
  guesses: string[];
}

const DEFAULT_STATS: GameStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
};

export async function loadStats(): Promise<GameStats> {
  const raw = await AsyncStorage.getItem(KEYS.stats);
  if (!raw) return { ...DEFAULT_STATS };
  return JSON.parse(raw) as GameStats;
}

export async function saveStats(stats: GameStats): Promise<void> {
  await AsyncStorage.setItem(KEYS.stats, JSON.stringify(stats));
}

export async function recordGame(won: boolean, guessCount: number): Promise<GameStats> {
  const stats = await loadStats();
  stats.totalPlayed += 1;

  if (won) {
    stats.totalWon += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] ?? 0) + 1;
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
