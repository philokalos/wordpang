import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStats,
  recordGame,
  loadDailyState,
  saveDailyState,
  type GameStats,
  type DailyState,
} from '../../services/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('loadStats', () => {
  it('should return default stats when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const stats = await loadStats();
    expect(stats).toEqual({
      totalPlayed: 0,
      totalWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {},
    });
  });

  it('should return saved stats from storage', async () => {
    const saved: GameStats = {
      totalPlayed: 5,
      totalWon: 3,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: { 3: 1, 4: 2 },
    };
    mockGetItem.mockResolvedValue(JSON.stringify(saved));

    const stats = await loadStats();
    expect(stats).toEqual(saved);
  });
});

describe('recordGame', () => {
  it('should increment totalWon and streak on win', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({
      totalPlayed: 1,
      totalWon: 1,
      currentStreak: 1,
      maxStreak: 1,
      guessDistribution: { 4: 1 },
    }));

    const stats = await recordGame(true, 3);
    expect(stats.totalPlayed).toBe(2);
    expect(stats.totalWon).toBe(2);
    expect(stats.currentStreak).toBe(2);
    expect(stats.maxStreak).toBe(2);
    expect(stats.guessDistribution[3]).toBe(1);
  });

  it('should reset streak on loss', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({
      totalPlayed: 3,
      totalWon: 3,
      currentStreak: 3,
      maxStreak: 3,
      guessDistribution: {},
    }));

    const stats = await recordGame(false, 6);
    expect(stats.totalPlayed).toBe(4);
    expect(stats.totalWon).toBe(3);
    expect(stats.currentStreak).toBe(0);
    expect(stats.maxStreak).toBe(3);
  });

  it('should record guess distribution correctly', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({
      totalPlayed: 0,
      totalWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {},
    }));

    const stats = await recordGame(true, 5);
    expect(stats.guessDistribution[5]).toBe(1);
  });

  it('should update maxStreak when current exceeds it', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({
      totalPlayed: 2,
      totalWon: 2,
      currentStreak: 2,
      maxStreak: 2,
      guessDistribution: {},
    }));

    const stats = await recordGame(true, 3);
    expect(stats.maxStreak).toBe(3);
    expect(stats.currentStreak).toBe(3);
  });

  it('should call saveStats after recording', async () => {
    mockGetItem.mockResolvedValue(null);
    await recordGame(true, 4);
    expect(mockSetItem).toHaveBeenCalledWith('wordle_stats', expect.any(String));
  });
});

describe('dailyState', () => {
  it('should return null when no daily state saved', async () => {
    mockGetItem.mockResolvedValue(null);
    const state = await loadDailyState();
    expect(state).toBeNull();
  });

  it('should roundtrip daily state', async () => {
    const state: DailyState = {
      date: '2026-03-10',
      completed: true,
      won: true,
      guesses: ['APPLE', 'GRAPE'],
    };

    await saveDailyState(state);
    expect(mockSetItem).toHaveBeenCalledWith('wordle_daily_state', JSON.stringify(state));
  });
});
