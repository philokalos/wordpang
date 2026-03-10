/**
 * DDD Domain Service Tests v3.0 (WordPop)
 *
 * Behavior contracts and invariants for:
 * 1. Spaced Repetition Service
 * 2. Expanded generateHint Service
 * 3. Adaptive Difficulty Recommendation
 * 4. Achievement Checking Service
 */

import {
  calculateNextReview,
  isWordDue,
  createReviewEntry,
  getDueWords,
} from '../../services/spaced-repetition';
import type { ReviewEntry } from '../types/review';
import { generateHint } from '../lib/game-logic';
import type { WordEntry } from '../types/word';
import type { WordCategory } from '../types/word';
import type { Difficulty } from '../types/game';
import { ACHIEVEMENT_DEFS } from '../types/achievement';

// ─── 1. Spaced Repetition Service ───────────────────────────────────────────

describe('Domain Service: Spaced Repetition', () => {
  beforeEach(() => jest.clearAllMocks());

  const BASE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

  describe('createReviewEntry', () => {
    it('should create entry with status new, reviewCount 0, word matching input', () => {
      const entry = createReviewEntry('HAPPY');

      expect(entry.word).toBe('HAPPY');
      expect(entry.status).toBe('new');
      expect(entry.reviewCount).toBe(0);
    });

    it('nextReview should be ~30 minutes from now (within 1 second tolerance)', () => {
      const before = Date.now();
      const entry = createReviewEntry('HAPPY');
      const after = Date.now();

      const expectedMin = before + BASE_INTERVAL_MS;
      const expectedMax = after + BASE_INTERVAL_MS + 1000;

      expect(entry.nextReview).toBeGreaterThanOrEqual(expectedMin);
      expect(entry.nextReview).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('calculateNextReview', () => {
    const makeEntry = (overrides: Partial<ReviewEntry> = {}): ReviewEntry => ({
      word: 'TEST',
      lastReviewed: Date.now() - 60000,
      reviewCount: 0,
      nextReview: Date.now() - 1000,
      status: 'new',
      ...overrides,
    });

    it('should increment reviewCount by 1', () => {
      const entry = makeEntry({ reviewCount: 2 });
      const result = calculateNextReview(entry);

      expect(result.reviewCount).toBe(3);
    });

    it('should set status to learning for reviewCount < 5', () => {
      for (const count of [0, 1, 2, 3, 4]) {
        const entry = makeEntry({ reviewCount: count });
        const result = calculateNextReview(entry);

        // After increment, reviewCount becomes count+1
        // Status is 'learning' when entry.reviewCount < 5 (checked before increment conceptually,
        // but in code: status is 'mastered' when entry.reviewCount >= 5, i.e., original count)
        if (count >= 5) {
          expect(result.status).toBe('mastered');
        } else {
          expect(result.status).toBe('learning');
        }
      }
    });

    it('should set status to mastered when reviewCount >= 5', () => {
      const entry = makeEntry({ reviewCount: 5 });
      const result = calculateNextReview(entry);

      expect(result.status).toBe('mastered');
      expect(result.reviewCount).toBe(6);
    });

    it('interval should grow exponentially: 30min, 60min, 120min', () => {
      const tolerance = 2000; // 2 second tolerance for execution time

      // reviewCount=0 → interval = 30min * 2^0 = 30min
      const before0 = Date.now();
      const result0 = calculateNextReview(makeEntry({ reviewCount: 0 }));
      const expected0 = before0 + BASE_INTERVAL_MS;
      expect(result0.nextReview).toBeGreaterThanOrEqual(expected0 - tolerance);
      expect(result0.nextReview).toBeLessThanOrEqual(expected0 + tolerance);

      // reviewCount=1 → interval = 30min * 2^1 = 60min
      const before1 = Date.now();
      const result1 = calculateNextReview(makeEntry({ reviewCount: 1 }));
      const expected1 = before1 + BASE_INTERVAL_MS * 2;
      expect(result1.nextReview).toBeGreaterThanOrEqual(expected1 - tolerance);
      expect(result1.nextReview).toBeLessThanOrEqual(expected1 + tolerance);

      // reviewCount=2 → interval = 30min * 2^2 = 120min
      const before2 = Date.now();
      const result2 = calculateNextReview(makeEntry({ reviewCount: 2 }));
      const expected2 = before2 + BASE_INTERVAL_MS * 4;
      expect(result2.nextReview).toBeGreaterThanOrEqual(expected2 - tolerance);
      expect(result2.nextReview).toBeLessThanOrEqual(expected2 + tolerance);
    });
  });

  describe('isWordDue', () => {
    it('should return true when nextReview is in the past', () => {
      const entry: ReviewEntry = {
        word: 'TEST',
        lastReviewed: Date.now() - 120000,
        reviewCount: 1,
        nextReview: Date.now() - 60000,
        status: 'learning',
      };

      expect(isWordDue(entry)).toBe(true);
    });

    it('should return false when nextReview is in the future', () => {
      const entry: ReviewEntry = {
        word: 'TEST',
        lastReviewed: Date.now(),
        reviewCount: 1,
        nextReview: Date.now() + 60000,
        status: 'learning',
      };

      expect(isWordDue(entry)).toBe(false);
    });
  });

  describe('getDueWords', () => {
    it('should return only entries where nextReview <= now', () => {
      const now = Date.now();
      const entries: ReviewEntry[] = [
        { word: 'DUE', lastReviewed: now - 60000, reviewCount: 1, nextReview: now - 1000, status: 'learning' },
        { word: 'NOT_DUE', lastReviewed: now, reviewCount: 1, nextReview: now + 60000, status: 'learning' },
        { word: 'ALSO_DUE', lastReviewed: now - 120000, reviewCount: 2, nextReview: now - 5000, status: 'learning' },
      ];

      const result = getDueWords(entries);
      const words = result.map((e) => e.word);

      expect(words).toContain('DUE');
      expect(words).toContain('ALSO_DUE');
      expect(words).not.toContain('NOT_DUE');
    });

    it('should sort by nextReview ascending (earliest first)', () => {
      const now = Date.now();
      const entries: ReviewEntry[] = [
        { word: 'LATER', lastReviewed: now - 60000, reviewCount: 1, nextReview: now - 1000, status: 'learning' },
        { word: 'EARLIEST', lastReviewed: now - 120000, reviewCount: 2, nextReview: now - 10000, status: 'learning' },
        { word: 'MIDDLE', lastReviewed: now - 90000, reviewCount: 1, nextReview: now - 5000, status: 'learning' },
      ];

      const result = getDueWords(entries);

      expect(result[0]?.word).toBe('EARLIEST');
      expect(result[1]?.word).toBe('MIDDLE');
      expect(result[2]?.word).toBe('LATER');
    });

    it('should return empty array for empty input', () => {
      const result = getDueWords([]);

      expect(result).toEqual([]);
    });
  });
});

// ─── 2. Expanded generateHint Service ───────────────────────────────────────

describe('Domain Service: generateHint (expanded)', () => {
  beforeEach(() => jest.clearAllMocks());

  const testWord: WordEntry = {
    word: 'HAPPY',
    meaning: '행복한',
    pronunciation: '해피',
    example: 'I am very happy today.',
    category: 'feeling',
    partOfSpeech: 'adjective',
  };

  describe('meaning hint', () => {
    it('should contain the word meaning', () => {
      const hint = generateHint(testWord, 'meaning');

      expect(hint).toContain('행복한');
    });

    it('should start with 뜻: ', () => {
      const hint = generateHint(testWord, 'meaning');

      expect(hint).toMatch(/^뜻: /);
    });
  });

  describe('letterPosition hint', () => {
    it('with no guesses should reveal a position (format: N번째 글자: X)', () => {
      const hint = generateHint(testWord, 'letterPosition');

      expect(hint).toMatch(/^\d번째 글자: [A-Z]$/);
    });

    it('with all positions already correct should return all-revealed message', () => {
      // Guess 'HAPPY' against target 'HAPPY' → all positions correct
      const hint = generateHint(testWord, 'letterPosition', ['HAPPY']);

      expect(hint).toBe('모든 위치가 이미 밝혀졌어요!');
    });

    it('with some correct guesses should NOT reveal already-correct positions', () => {
      // HIPPY vs HAPPY:
      // H=H (pos 0 correct), I!=A (pos 1 wrong), P=P (pos 2 correct),
      // P=P (pos 3 correct), Y=Y (pos 4 correct)
      // Only position 1 is unrevealed → hint should say "2번째 글자: A"
      const hint = generateHint(testWord, 'letterPosition', ['HIPPY']);

      expect(hint).toBe('2번째 글자: A');
    });
  });
});

// ─── 3. Adaptive Difficulty Recommendation ──────────────────────────────────

// Import the hook's getRecommendation logic by testing through the hook
jest.mock('../../services/storage', () => ({
  loadStats: jest.fn(),
  recordGame: jest.fn(),
  loadAchievements: jest.fn().mockResolvedValue([]),
  saveAchievements: jest.fn().mockResolvedValue(undefined),
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { useStats } from '../../hooks/useStats';
import { loadStats } from '../../services/storage';

const mockLoadStats = loadStats as jest.MockedFunction<typeof loadStats>;

describe('Domain Service: Adaptive Difficulty Recommendation', () => {
  beforeEach(() => jest.clearAllMocks());

  const makeStats = (overrides: Record<string, unknown> = {}) => ({
    totalPlayed: 10,
    totalWon: 5,
    currentStreak: 3,
    maxStreak: 5,
    guessDistribution: {},
    difficultyStats: {
      easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      normal: { gamesPlayed: 10, gamesWon: 5, totalGuesses: 35 },
      hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
    },
    ...overrides,
  });

  it('returns null when gamesPlayed < 5', async () => {
    mockLoadStats.mockResolvedValue(makeStats({
      difficultyStats: {
        easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
        normal: { gamesPlayed: 3, gamesWon: 2, totalGuesses: 6 },
        hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      },
    }));

    const { result } = renderHook(() => useStats());
    await waitFor(() => {
      expect(result.current.stats.difficultyStats.normal.gamesPlayed).toBe(3);
    });

    expect(result.current.getDifficultyRecommendation('normal')).toBeNull();
  });

  it('returns up when winRate >= 80% and avgGuesses <= 3.5 and difficulty != hard', async () => {
    mockLoadStats.mockResolvedValue(makeStats({
      difficultyStats: {
        easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
        normal: { gamesPlayed: 10, gamesWon: 9, totalGuesses: 27 }, // 90% win, 3.0 avg
        hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      },
    }));

    const { result } = renderHook(() => useStats());
    await waitFor(() => {
      expect(result.current.stats.difficultyStats.normal.gamesWon).toBe(9);
    });

    expect(result.current.getDifficultyRecommendation('normal')).toBe('up');
  });

  it('returns down when winRate < 30% and difficulty != easy', async () => {
    mockLoadStats.mockResolvedValue(makeStats({
      difficultyStats: {
        easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
        normal: { gamesPlayed: 10, gamesWon: 2, totalGuesses: 10 }, // 20% win
        hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      },
    }));

    const { result } = renderHook(() => useStats());
    await waitFor(() => {
      expect(result.current.stats.difficultyStats.normal.gamesWon).toBe(2);
    });

    expect(result.current.getDifficultyRecommendation('normal')).toBe('down');
  });

  it('returns null when stats are moderate (neither up nor down)', async () => {
    mockLoadStats.mockResolvedValue(makeStats({
      difficultyStats: {
        easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
        normal: { gamesPlayed: 10, gamesWon: 5, totalGuesses: 20 }, // 50% win, 4.0 avg
        hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      },
    }));

    const { result } = renderHook(() => useStats());
    await waitFor(() => {
      expect(result.current.stats.difficultyStats.normal.gamesWon).toBe(5);
    });

    expect(result.current.getDifficultyRecommendation('normal')).toBeNull();
  });
});

// ─── 4. Achievement Checking Service ────────────────────────────────────────

import { checkAchievements, getAllAchievements } from '../../services/achievements';
import { loadAchievements, saveAchievements } from '../../services/storage';

const mockLoadAchievements = loadAchievements as jest.MockedFunction<typeof loadAchievements>;
const mockSaveAchievements = saveAchievements as jest.MockedFunction<typeof saveAchievements>;

describe('Domain Service: Achievement Checking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAchievements.mockResolvedValue([]);
    mockSaveAchievements.mockResolvedValue(undefined);
  });

  const baseContext = {
    stats: {
      totalPlayed: 10,
      totalWon: 5,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: {},
      difficultyStats: {
        easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
        normal: { gamesPlayed: 10, gamesWon: 5, totalGuesses: 35 },
        hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      },
    },
    learnedCount: 5,
    reviewCount: 3,
    playedCategories: ['animal', 'food'] as WordCategory[],
    lastGameWon: true,
    lastGuessCount: 3,
    lastHintsUsed: 1,
    lastDifficulty: 'normal' as Difficulty,
    isDaily: false,
  };

  describe('checkAchievements', () => {
    it('should unlock first_win when totalWon >= 1', async () => {
      const ctx = { ...baseContext, stats: { ...baseContext.stats, totalWon: 1 } };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'first_win')).toBe(true);
    });

    it('should unlock streak_3 when currentStreak >= 3', async () => {
      const ctx = { ...baseContext, stats: { ...baseContext.stats, currentStreak: 3 } };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'streak_3')).toBe(true);
    });

    it('should unlock perfect_guess when lastGameWon && lastGuessCount === 1', async () => {
      const ctx = { ...baseContext, lastGameWon: true, lastGuessCount: 1 };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'perfect_guess')).toBe(true);
    });

    it('should unlock no_hints when lastGameWon && lastHintsUsed === 0', async () => {
      const ctx = { ...baseContext, lastGameWon: true, lastHintsUsed: 0 };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'no_hints')).toBe(true);
    });

    it('should unlock hard_win when lastGameWon && lastDifficulty === hard', async () => {
      const ctx = { ...baseContext, lastGameWon: true, lastDifficulty: 'hard' as Difficulty };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'hard_win')).toBe(true);
    });

    it('should unlock daily_first when isDaily && lastGameWon', async () => {
      const ctx = { ...baseContext, isDaily: true, lastGameWon: true };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'daily_first')).toBe(true);
    });

    it('should NOT re-unlock already-unlocked achievements', async () => {
      const alreadyUnlocked = [
        { id: 'first_win', title: '첫 승리!', description: '처음으로 단어를 맞혔어요', icon: '🏆', unlockedAt: Date.now() - 10000 },
        { id: 'streak_3', title: '3일 연속!', description: '3일 연속 게임에 성공했어요', icon: '🔥', unlockedAt: Date.now() - 10000 },
      ];
      mockLoadAchievements.mockResolvedValue(alreadyUnlocked);

      const result = await checkAchievements(baseContext);

      expect(result.some((a) => a.id === 'first_win')).toBe(false);
      expect(result.some((a) => a.id === 'streak_3')).toBe(false);
    });

    it('should save achievements when new ones unlock', async () => {
      const ctx = { ...baseContext, stats: { ...baseContext.stats, totalWon: 1 } };
      await checkAchievements(ctx);

      expect(mockSaveAchievements).toHaveBeenCalledTimes(1);
      const savedArg = mockSaveAchievements.mock.calls[0]?.[0];
      expect(savedArg?.some((a) => a.id === 'first_win')).toBe(true);
    });

    it('should NOT save when no new achievements unlock', async () => {
      // All possible achievements for this context are already unlocked
      const allUnlocked = ACHIEVEMENT_DEFS.map((def) => ({
        ...def,
        unlockedAt: Date.now() - 10000,
      }));
      mockLoadAchievements.mockResolvedValue(allUnlocked);

      await checkAchievements(baseContext);

      expect(mockSaveAchievements).not.toHaveBeenCalled();
    });

    it('should unlock all_categories when all 8 categories played', async () => {
      const allCategories: WordCategory[] = [
        'animal', 'food', 'school', 'nature', 'body', 'home', 'action', 'feeling',
      ];
      const ctx = { ...baseContext, playedCategories: allCategories };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'all_categories')).toBe(true);
    });
  });

  describe('getAllAchievements', () => {
    it('should return all 15 definitions with unlocked status merged', async () => {
      const unlockedAchievements = [
        { id: 'first_win', title: '첫 승리!', description: '처음으로 단어를 맞혔어요', icon: '🏆', unlockedAt: 1700000000000 },
      ];
      mockLoadAchievements.mockResolvedValue(unlockedAchievements);

      const result = await getAllAchievements();

      expect(result).toHaveLength(15);

      const firstWin = result.find((a) => a.id === 'first_win');
      expect(firstWin?.unlockedAt).toBe(1700000000000);

      const streak3 = result.find((a) => a.id === 'streak_3');
      expect(streak3?.unlockedAt).toBeUndefined();
    });
  });
});
