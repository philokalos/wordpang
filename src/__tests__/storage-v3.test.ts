/**
 * Storage v3.0 (WordPop) Integration Tests
 *
 * DDD storage contract tests for v3 features:
 * - Difficulty-aware recordGame
 * - Learned words tracking
 * - Spaced-repetition review entries
 * - Achievements persistence
 * - Played categories tracking
 * - Backward-compatible loadStats
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadStats,
  recordGame,
  type GameStats,
} from '../../services/storage';
import { loadLearnedWords, markWordLearned } from '../../services/storage';
import { loadReviewEntries, saveReviewEntry } from '../../services/storage';
import { loadAchievements, saveAchievements } from '../../services/storage';
import { loadPlayedCategories, addPlayedCategory } from '../../services/storage';
import type { ReviewEntry } from '../types/review';
import type { Achievement } from '../types/achievement';
import type { WordCategory } from '../types/word';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

// ---------------------------------------------------------------------------
// 1. recordGame with difficulty tracking
// ---------------------------------------------------------------------------
describe('recordGame with difficulty tracking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should update difficultyStats for the specified difficulty', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);

    const stats = await recordGame(true, 3, 'hard');

    expect(stats.difficultyStats.hard.gamesPlayed).toBe(1);
    expect(stats.difficultyStats.hard.gamesWon).toBe(1);
    expect(stats.difficultyStats.hard.totalGuesses).toBe(3);
  });

  it('should increment gamesPlayed, gamesWon, totalGuesses for that difficulty', async () => {
    const existing: GameStats = {
      totalPlayed: 5,
      totalWon: 3,
      currentStreak: 2,
      maxStreak: 3,
      guessDistribution: { 3: 1, 4: 2 },
      difficultyStats: {
        easy: { gamesPlayed: 2, gamesWon: 2, totalGuesses: 6 },
        normal: { gamesPlayed: 3, gamesWon: 1, totalGuesses: 12 },
        hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      },
    };
    mockGetItem.mockResolvedValue(JSON.stringify(existing));
    mockSetItem.mockResolvedValue(undefined);

    const stats = await recordGame(true, 4, 'easy');

    expect(stats.difficultyStats.easy.gamesPlayed).toBe(3);
    expect(stats.difficultyStats.easy.gamesWon).toBe(3);
    expect(stats.difficultyStats.easy.totalGuesses).toBe(10);
  });

  it('should not affect other difficulties stats', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);

    const stats = await recordGame(true, 5, 'normal');

    expect(stats.difficultyStats.easy.gamesPlayed).toBe(0);
    expect(stats.difficultyStats.easy.gamesWon).toBe(0);
    expect(stats.difficultyStats.hard.gamesPlayed).toBe(0);
    expect(stats.difficultyStats.hard.gamesWon).toBe(0);
  });

  it.each<['easy' | 'normal' | 'hard']>([['easy'], ['normal'], ['hard']])(
    'should work with %s difficulty',
    async (difficulty) => {
      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const stats = await recordGame(true, 3, difficulty);

      expect(stats.difficultyStats[difficulty].gamesPlayed).toBe(1);
      expect(stats.difficultyStats[difficulty].gamesWon).toBe(1);
      expect(stats.difficultyStats[difficulty].totalGuesses).toBe(3);
    },
  );
});

// ---------------------------------------------------------------------------
// 2. Learned Words
// ---------------------------------------------------------------------------
describe('Learned Words', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loadLearnedWords should return empty array when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await loadLearnedWords();

    expect(result).toEqual([]);
    expect(mockGetItem).toHaveBeenCalledWith('wordpop_learned_words');
  });

  it('loadLearnedWords should return parsed array from storage', async () => {
    const data = [
      { word: 'apple', firstSeen: 1000, timesCorrect: 3 },
      { word: 'grape', firstSeen: 2000, timesCorrect: 1 },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(data));

    const result = await loadLearnedWords();

    expect(result).toEqual(data);
  });

  it('markWordLearned should add a new word with timesCorrect=1 and firstSeen set', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([]));
    mockSetItem.mockResolvedValue(undefined);

    const before = Date.now();
    const result = await markWordLearned('tiger');
    const after = Date.now();

    expect(result).toHaveLength(1);
    expect(result[0].word).toBe('tiger');
    expect(result[0].timesCorrect).toBe(1);
    expect(result[0].firstSeen).toBeGreaterThanOrEqual(before);
    expect(result[0].firstSeen).toBeLessThanOrEqual(after);
  });

  it('markWordLearned should increment timesCorrect for existing word (not duplicate)', async () => {
    const existing = [{ word: 'tiger', firstSeen: 1000, timesCorrect: 2 }];
    mockGetItem.mockResolvedValue(JSON.stringify(existing));
    mockSetItem.mockResolvedValue(undefined);

    const result = await markWordLearned('tiger');

    expect(result).toHaveLength(1);
    expect(result[0].timesCorrect).toBe(3);
    expect(result[0].firstSeen).toBe(1000); // unchanged
  });

  it('markWordLearned should save to AsyncStorage with key wordpop_learned_words', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([]));
    mockSetItem.mockResolvedValue(undefined);

    await markWordLearned('bird');

    expect(mockSetItem).toHaveBeenCalledWith(
      'wordpop_learned_words',
      expect.any(String),
    );
    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved[0].word).toBe('bird');
  });
});

// ---------------------------------------------------------------------------
// 3. Review Entries
// ---------------------------------------------------------------------------
describe('Review Entries', () => {
  beforeEach(() => jest.clearAllMocks());

  const makeEntry = (overrides: Partial<ReviewEntry> = {}): ReviewEntry => ({
    word: 'apple',
    lastReviewed: 1000,
    reviewCount: 1,
    nextReview: 2000,
    status: 'learning',
    ...overrides,
  });

  it('loadReviewEntries should return empty array when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await loadReviewEntries();

    expect(result).toEqual([]);
    expect(mockGetItem).toHaveBeenCalledWith('wordpop_review_entries');
  });

  it('loadReviewEntries should return parsed entries from storage', async () => {
    const data = [makeEntry(), makeEntry({ word: 'grape', status: 'mastered' })];
    mockGetItem.mockResolvedValue(JSON.stringify(data));

    const result = await loadReviewEntries();

    expect(result).toEqual(data);
  });

  it('saveReviewEntry should add new entry when word not found', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([]));
    mockSetItem.mockResolvedValue(undefined);

    const entry = makeEntry({ word: 'melon' });
    await saveReviewEntry(entry);

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].word).toBe('melon');
  });

  it('saveReviewEntry should update existing entry when word already exists', async () => {
    const old = makeEntry({ word: 'melon', reviewCount: 1 });
    mockGetItem.mockResolvedValue(JSON.stringify([old]));
    mockSetItem.mockResolvedValue(undefined);

    const updated = makeEntry({ word: 'melon', reviewCount: 5, status: 'mastered' });
    await saveReviewEntry(updated);

    const saved = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved[0].reviewCount).toBe(5);
    expect(saved[0].status).toBe('mastered');
  });

  it('saveReviewEntry should save to key wordpop_review_entries', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([]));
    mockSetItem.mockResolvedValue(undefined);

    await saveReviewEntry(makeEntry());

    expect(mockSetItem).toHaveBeenCalledWith(
      'wordpop_review_entries',
      expect.any(String),
    );
  });
});

// ---------------------------------------------------------------------------
// 4. Achievements Storage
// ---------------------------------------------------------------------------
describe('Achievements Storage', () => {
  beforeEach(() => jest.clearAllMocks());

  const sampleAchievement: Achievement = {
    id: 'first_win',
    title: 'First Win',
    description: 'Won for the first time',
    icon: 'trophy',
    unlockedAt: 1234567890,
  };

  it('loadAchievements should return empty array when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await loadAchievements();

    expect(result).toEqual([]);
    expect(mockGetItem).toHaveBeenCalledWith('wordpop_achievements');
  });

  it('loadAchievements should return parsed achievements', async () => {
    const data = [sampleAchievement];
    mockGetItem.mockResolvedValue(JSON.stringify(data));

    const result = await loadAchievements();

    expect(result).toEqual(data);
  });

  it('saveAchievements should save to key wordpop_achievements', async () => {
    mockSetItem.mockResolvedValue(undefined);

    await saveAchievements([sampleAchievement]);

    expect(mockSetItem).toHaveBeenCalledWith(
      'wordpop_achievements',
      JSON.stringify([sampleAchievement]),
    );
  });
});

// ---------------------------------------------------------------------------
// 5. Played Categories
// ---------------------------------------------------------------------------
describe('Played Categories', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loadPlayedCategories should return empty array when storage is empty', async () => {
    mockGetItem.mockResolvedValue(null);

    const result = await loadPlayedCategories();

    expect(result).toEqual([]);
    expect(mockGetItem).toHaveBeenCalledWith('wordpop_played_categories');
  });

  it('addPlayedCategory should add new category', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([]));
    mockSetItem.mockResolvedValue(undefined);

    const result = await addPlayedCategory('animal' as WordCategory);

    expect(result).toContain('animal');
    expect(mockSetItem).toHaveBeenCalledWith(
      'wordpop_played_categories',
      JSON.stringify(['animal']),
    );
  });

  it('addPlayedCategory should not duplicate existing category', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['animal']));
    mockSetItem.mockResolvedValue(undefined);

    const result = await addPlayedCategory('animal' as WordCategory);

    expect(result).toEqual(['animal']);
    // setItem should NOT be called when category already exists
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('addPlayedCategory should save to key wordpop_played_categories', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['food']));
    mockSetItem.mockResolvedValue(undefined);

    await addPlayedCategory('nature' as WordCategory);

    expect(mockSetItem).toHaveBeenCalledWith(
      'wordpop_played_categories',
      JSON.stringify(['food', 'nature']),
    );
  });
});

// ---------------------------------------------------------------------------
// 6. loadStats backward compatibility
// ---------------------------------------------------------------------------
describe('loadStats backward compatibility', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should fill in default difficultyStats when field is missing', async () => {
    const legacy = {
      totalPlayed: 10,
      totalWon: 7,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: { 3: 2, 4: 5 },
      // no difficultyStats
    };
    mockGetItem.mockResolvedValue(JSON.stringify(legacy));

    const stats = await loadStats();

    expect(stats.totalPlayed).toBe(10);
    expect(stats.difficultyStats).toEqual({
      easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      normal: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
    });
  });

  it('should merge partial difficultyStats with defaults', async () => {
    const partial = {
      totalPlayed: 5,
      totalWon: 3,
      currentStreak: 1,
      maxStreak: 2,
      guessDistribution: {},
      difficultyStats: {
        easy: { gamesPlayed: 2, gamesWon: 1 },
        // normal and hard missing entirely
      },
    };
    mockGetItem.mockResolvedValue(JSON.stringify(partial));

    const stats = await loadStats();

    // easy should have partial values merged with defaults
    expect(stats.difficultyStats.easy.gamesPlayed).toBe(2);
    expect(stats.difficultyStats.easy.gamesWon).toBe(1);
    expect(stats.difficultyStats.easy.totalGuesses).toBe(0); // filled from default

    // normal and hard should be full defaults
    expect(stats.difficultyStats.normal).toEqual({
      gamesPlayed: 0,
      gamesWon: 0,
      totalGuesses: 0,
    });
    expect(stats.difficultyStats.hard).toEqual({
      gamesPlayed: 0,
      gamesWon: 0,
      totalGuesses: 0,
    });
  });
});
