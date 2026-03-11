/**
 * DDD Domain Service Tests — Storage Error Handling
 *
 * Verifies that all storage functions gracefully handle AsyncStorage failures:
 * - Load functions return safe defaults when getItem throws
 * - Save functions do not crash when setItem throws
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStats,
  saveStats,
  loadDailyState,
  saveDailyState,
  loadLearnedWords,
  markWordLearned,
  loadReviewEntries,
  loadAchievements,
  saveAchievements,
  loadPlayedCategories,
  type GameStats,
  type DailyState,
} from '../../services/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

const emptyDifficultyStats = {
  easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
  normal: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
  hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── 1. Load functions return defaults on AsyncStorage.getItem error ─────────

describe('Storage Error Handling: getItem throws', () => {
  beforeEach(() => {
    mockGetItem.mockRejectedValue(new Error('AsyncStorage read failure'));
  });

  it('loadStats should return fresh default stats', async () => {
    const stats = await loadStats();

    expect(stats).toEqual({
      totalPlayed: 0,
      totalWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {},
      difficultyStats: emptyDifficultyStats,
    });
  });

  it('loadLearnedWords should return empty array', async () => {
    const result = await loadLearnedWords();

    expect(result).toEqual([]);
  });

  it('loadReviewEntries should return empty array', async () => {
    const result = await loadReviewEntries();

    expect(result).toEqual([]);
  });

  it('loadAchievements should return empty array', async () => {
    const result = await loadAchievements();

    expect(result).toEqual([]);
  });

  it('loadDailyState should return null', async () => {
    const result = await loadDailyState();

    expect(result).toBeNull();
  });

  it('loadPlayedCategories should return empty array', async () => {
    const result = await loadPlayedCategories();

    expect(result).toEqual([]);
  });

  it('markWordLearned should not crash (loadLearnedWords catches internally)', async () => {
    // loadLearnedWords has its own try-catch, so it returns [] on getItem error.
    // markWordLearned then adds the word and saves — setItem is not rejected here,
    // so the result includes the newly added word.
    const result = await markWordLearned('tiger');

    expect(result).toHaveLength(1);
    expect(result[0].word).toBe('tiger');
  });
});

// ─── 2. Save functions don't crash on AsyncStorage.setItem error ─────────────

describe('Storage Error Handling: setItem throws', () => {
  beforeEach(() => {
    mockSetItem.mockRejectedValue(new Error('AsyncStorage write failure'));
  });

  it('saveStats should not throw', async () => {
    const stats: GameStats = {
      totalPlayed: 5,
      totalWon: 3,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: { 3: 1 },
      difficultyStats: emptyDifficultyStats,
    };

    await expect(saveStats(stats)).resolves.toBeUndefined();
  });

  it('saveAchievements should not throw', async () => {
    const achievements = [
      { id: 'first_win', title: 'First', description: 'Won', icon: 'trophy', unlockedAt: Date.now() },
    ];

    await expect(saveAchievements(achievements)).resolves.toBeUndefined();
  });

  it('saveDailyState should not throw', async () => {
    const state: DailyState = {
      date: '2026-03-11',
      completed: true,
      won: true,
      guesses: ['APPLE'],
    };

    await expect(saveDailyState(state)).resolves.toBeUndefined();
  });

  it('markWordLearned should not throw when setItem fails', async () => {
    // getItem returns valid data, but setItem rejects
    mockGetItem.mockResolvedValue(JSON.stringify([]));

    // markWordLearned catches setItem errors and returns []
    const result = await markWordLearned('tiger');

    expect(result).toEqual([]);
  });
});

// ─── 3. Corrupted JSON in storage ────────────────────────────────────────────

describe('Storage Error Handling: corrupted JSON', () => {
  beforeEach(() => {
    mockGetItem.mockResolvedValue('NOT_VALID_JSON{{{');
  });

  it('loadStats should return fresh defaults on parse error', async () => {
    const stats = await loadStats();

    expect(stats).toEqual({
      totalPlayed: 0,
      totalWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {},
      difficultyStats: emptyDifficultyStats,
    });
  });

  it('loadLearnedWords should return empty array on parse error', async () => {
    const result = await loadLearnedWords();

    expect(result).toEqual([]);
  });

  it('loadReviewEntries should return empty array on parse error', async () => {
    const result = await loadReviewEntries();

    expect(result).toEqual([]);
  });

  it('loadAchievements should return empty array on parse error', async () => {
    const result = await loadAchievements();

    expect(result).toEqual([]);
  });

  it('loadDailyState should return null on parse error', async () => {
    const result = await loadDailyState();

    expect(result).toBeNull();
  });

  it('loadPlayedCategories should return empty array on parse error', async () => {
    const result = await loadPlayedCategories();

    expect(result).toEqual([]);
  });
});
