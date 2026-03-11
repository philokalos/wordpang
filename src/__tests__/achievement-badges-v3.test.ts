/**
 * DDD Domain Service Tests — New Achievement Badges (v3.0)
 *
 * Tests for the 6 new achievement badges added in WordPop v3:
 * 1. speed_learner — 2 guesses or fewer, 5+ times
 * 2. no_hints_10 — 10+ wins without hints
 * 3. category_master_animal — all animal words learned
 * 4. category_master_food — all food words learned
 * 5. consistency — 7+ day play streak
 * 6. review_expert — 30+ reviews completed
 */

jest.mock('../../services/storage', () => ({
  loadAchievements: jest.fn().mockResolvedValue([]),
  saveAchievements: jest.fn().mockResolvedValue(undefined),
}));

import { checkAchievements } from '../../services/achievements';
import { loadAchievements, saveAchievements } from '../../services/storage';
import type { WordCategory, WordEntry } from '../types/word';
import type { Difficulty } from '../types/game';

const mockLoadAchievements = loadAchievements as jest.MockedFunction<typeof loadAchievements>;
const mockSaveAchievements = saveAchievements as jest.MockedFunction<typeof saveAchievements>;

describe('Domain Service: New Achievement Badges (v3.0)', () => {
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

  // ─── 1. speed_learner ──────────────────────────────────────────────────────

  describe('speed_learner', () => {
    it('should unlock when guessDistribution[1] + [2] >= 5', async () => {
      const ctx = {
        ...baseContext,
        stats: {
          ...baseContext.stats,
          guessDistribution: { 1: 2, 2: 3 }, // total 5
        },
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'speed_learner')).toBe(true);
    });

    it('should unlock when speedWinCount is provided and >= 5', async () => {
      const ctx = {
        ...baseContext,
        speedWinCount: 5,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'speed_learner')).toBe(true);
    });

    it('should NOT unlock when guessDistribution[1] + [2] < 5', async () => {
      const ctx = {
        ...baseContext,
        stats: {
          ...baseContext.stats,
          guessDistribution: { 1: 1, 2: 2 }, // total 3
        },
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'speed_learner')).toBe(false);
    });

    it('should count only keys 1 and 2 from guessDistribution', async () => {
      const ctx = {
        ...baseContext,
        stats: {
          ...baseContext.stats,
          guessDistribution: { 1: 0, 2: 4, 3: 10, 4: 20 }, // only 4 speed wins
        },
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'speed_learner')).toBe(false);
    });

    it('should handle missing distribution keys gracefully', async () => {
      const ctx = {
        ...baseContext,
        stats: {
          ...baseContext.stats,
          guessDistribution: { 3: 5, 4: 10 }, // no key 1 or 2
        },
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'speed_learner')).toBe(false);
    });
  });

  // ─── 2. no_hints_10 ───────────────────────────────────────────────────────

  describe('no_hints_10', () => {
    it('should unlock when noHintWinCount >= 10', async () => {
      const ctx = {
        ...baseContext,
        noHintWinCount: 10,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'no_hints_10')).toBe(true);
    });

    it('should NOT unlock when noHintWinCount < 10', async () => {
      const ctx = {
        ...baseContext,
        noHintWinCount: 9,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'no_hints_10')).toBe(false);
    });

    it('should NOT unlock when noHintWinCount is undefined (defaults to 0)', async () => {
      const ctx = { ...baseContext };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'no_hints_10')).toBe(false);
    });
  });

  // ─── 3. category_master_animal ─────────────────────────────────────────────

  describe('category_master_animal', () => {
    const animalWords: WordEntry[] = [
      { word: 'BEAR', meaning: '곰', pronunciation: '베어', example: 'A bear lives in the forest.', category: 'animal', partOfSpeech: 'noun' },
      { word: 'DUCK', meaning: '오리', pronunciation: '덕', example: 'The duck swims.', category: 'animal', partOfSpeech: 'noun' },
      { word: 'FISH', meaning: '물고기', pronunciation: '피쉬', example: 'I caught a fish.', category: 'animal', partOfSpeech: 'noun' },
    ];

    const foodWords: WordEntry[] = [
      { word: 'CAKE', meaning: '케이크', pronunciation: '케이크', example: 'I like cake.', category: 'food', partOfSpeech: 'noun' },
    ];

    it('should unlock when all animal words are learned', async () => {
      const ctx = {
        ...baseContext,
        learnedWordsList: ['BEAR', 'DUCK', 'FISH', 'CAKE'],
        allAnswerWords: [...animalWords, ...foodWords],
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'category_master_animal')).toBe(true);
    });

    it('should NOT unlock when some animal words are missing', async () => {
      const ctx = {
        ...baseContext,
        learnedWordsList: ['BEAR', 'DUCK'], // missing FISH
        allAnswerWords: [...animalWords, ...foodWords],
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'category_master_animal')).toBe(false);
    });

    it('should NOT unlock when learnedWordsList is not provided', async () => {
      const ctx = { ...baseContext };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'category_master_animal')).toBe(false);
    });

    it('should NOT unlock when allAnswerWords is not provided', async () => {
      const ctx = {
        ...baseContext,
        learnedWordsList: ['BEAR', 'DUCK', 'FISH'],
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'category_master_animal')).toBe(false);
    });
  });

  // ─── 4. category_master_food ───────────────────────────────────────────────

  describe('category_master_food', () => {
    const foodWords: WordEntry[] = [
      { word: 'CAKE', meaning: '케이크', pronunciation: '케이크', example: 'I like cake.', category: 'food', partOfSpeech: 'noun' },
      { word: 'RICE', meaning: '쌀', pronunciation: '라이스', example: 'I eat rice.', category: 'food', partOfSpeech: 'noun' },
    ];

    const animalWords: WordEntry[] = [
      { word: 'BEAR', meaning: '곰', pronunciation: '베어', example: 'A bear.', category: 'animal', partOfSpeech: 'noun' },
    ];

    it('should unlock when all food words are learned', async () => {
      const ctx = {
        ...baseContext,
        learnedWordsList: ['CAKE', 'RICE', 'BEAR'],
        allAnswerWords: [...foodWords, ...animalWords],
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'category_master_food')).toBe(true);
    });

    it('should NOT unlock when some food words are missing', async () => {
      const ctx = {
        ...baseContext,
        learnedWordsList: ['CAKE'], // missing RICE
        allAnswerWords: [...foodWords, ...animalWords],
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'category_master_food')).toBe(false);
    });
  });

  // ─── 5. consistency ────────────────────────────────────────────────────────

  describe('consistency', () => {
    it('should unlock when playStreak >= 7', async () => {
      const ctx = {
        ...baseContext,
        playStreak: 7,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'consistency')).toBe(true);
    });

    it('should unlock when playStreak > 7', async () => {
      const ctx = {
        ...baseContext,
        playStreak: 14,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'consistency')).toBe(true);
    });

    it('should NOT unlock when playStreak < 7', async () => {
      const ctx = {
        ...baseContext,
        playStreak: 6,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'consistency')).toBe(false);
    });

    it('should fall back to currentStreak when playStreak is undefined', async () => {
      // baseContext has currentStreak: 3, so consistency should NOT unlock
      const ctx = { ...baseContext };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'consistency')).toBe(false);
    });

    it('should unlock via currentStreak fallback when currentStreak >= 7', async () => {
      const ctx = {
        ...baseContext,
        stats: { ...baseContext.stats, currentStreak: 7 },
        // playStreak is undefined, falls back to currentStreak
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'consistency')).toBe(true);
    });
  });

  // ─── 6. review_expert ──────────────────────────────────────────────────────

  describe('review_expert', () => {
    it('should unlock when reviewCount >= 30', async () => {
      const ctx = {
        ...baseContext,
        reviewCount: 30,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'review_expert')).toBe(true);
    });

    it('should unlock when reviewCount > 30', async () => {
      const ctx = {
        ...baseContext,
        reviewCount: 50,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'review_expert')).toBe(true);
    });

    it('should NOT unlock when reviewCount < 30', async () => {
      const ctx = {
        ...baseContext,
        reviewCount: 29,
      };
      const result = await checkAchievements(ctx);

      expect(result.some((a) => a.id === 'review_expert')).toBe(false);
    });
  });
});
