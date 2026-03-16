import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAchievements } from '../useAchievements';
import type { Achievement } from '../../src/types/achievement';
import type { WordCategory } from '../../src/types/word';

const mockAchievements: Achievement[] = [
  { id: 'first_win', title: '첫 승리!', description: '처음으로 단어를 맞혔어요', icon: '🏆', unlockedAt: 1000 },
  { id: 'streak_3', title: '3일 연속!', description: '3일 연속 게임에 성공했어요', icon: '🔥' },
  { id: 'streak_7', title: '일주일 연속!', description: '7일 연속 게임에 성공했어요', icon: '⚡' },
];

const mockStats = {
  totalPlayed: 10,
  totalWon: 8,
  currentStreak: 3,
  maxStreak: 5,
  guessDistribution: {},
};

jest.mock('../../services/achievements', () => ({
  checkAchievements: jest.fn(),
  getAllAchievements: jest.fn(),
}));

jest.mock('../../services/storage', () => ({
  loadPlayedCategories: jest.fn(),
  addPlayedCategory: jest.fn(),
}));

const achievementsSvc = require('../../services/achievements') as {
  checkAchievements: jest.Mock;
  getAllAchievements: jest.Mock;
};

const storage = require('../../services/storage') as {
  loadPlayedCategories: jest.Mock;
  addPlayedCategory: jest.Mock;
};

describe('useAchievements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    achievementsSvc.getAllAchievements.mockResolvedValue(mockAchievements);
    storage.loadPlayedCategories.mockResolvedValue(['animal'] as WordCategory[]);
    achievementsSvc.checkAchievements.mockResolvedValue([]);
    storage.addPlayedCategory.mockResolvedValue(['animal', 'food'] as WordCategory[]);
  });

  it('should load achievements and playedCategories on mount', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.achievements).toHaveLength(3);
    });

    expect(achievementsSvc.getAllAchievements).toHaveBeenCalledTimes(1);
    expect(storage.loadPlayedCategories).toHaveBeenCalledTimes(1);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.unlockedCount).toBe(1); // only first_win has unlockedAt
  });

  it('should have empty newUnlocked when check returns no new badges', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.achievements).toHaveLength(3);
    });

    await act(async () => {
      const unlocked = await result.current.check({
        stats: mockStats,
        learnedCount: 5,
        reviewCount: 2,
        lastGameWon: true,
        lastGuessCount: 3,
        lastHintsUsed: 0,
        lastDifficulty: 'normal',
        isDaily: false,
      });
      expect(unlocked).toHaveLength(0);
    });

    expect(result.current.newUnlocked).toHaveLength(0);
  });

  it('should update newUnlocked and reload achievements when new badge unlocked', async () => {
    const newBadge: Achievement = { ...mockAchievements[1], unlockedAt: Date.now() };
    achievementsSvc.checkAchievements.mockResolvedValue([newBadge]);
    const updatedAchievements = [mockAchievements[0], newBadge, mockAchievements[2]];
    achievementsSvc.getAllAchievements
      .mockResolvedValueOnce(mockAchievements)  // initial load
      .mockResolvedValueOnce(updatedAchievements); // after check

    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.achievements).toHaveLength(3);
    });

    await act(async () => {
      await result.current.check({
        stats: mockStats,
        learnedCount: 10,
        reviewCount: 5,
        lastGameWon: true,
        lastGuessCount: 2,
        lastHintsUsed: 0,
        lastDifficulty: 'normal',
        isDaily: false,
      });
    });

    expect(result.current.newUnlocked).toHaveLength(1);
    expect(result.current.newUnlocked[0].id).toBe('streak_3');
    expect(achievementsSvc.getAllAchievements).toHaveBeenCalledTimes(2);
    expect(result.current.unlockedCount).toBe(2);
  });

  it('should clear newUnlocked on dismissNewUnlocked', async () => {
    const newBadge: Achievement = { ...mockAchievements[1], unlockedAt: Date.now() };
    achievementsSvc.checkAchievements.mockResolvedValue([newBadge]);
    achievementsSvc.getAllAchievements
      .mockResolvedValueOnce(mockAchievements)
      .mockResolvedValueOnce([mockAchievements[0], newBadge, mockAchievements[2]]);

    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.achievements).toHaveLength(3);
    });

    await act(async () => {
      await result.current.check({
        stats: mockStats,
        learnedCount: 10,
        reviewCount: 5,
        lastGameWon: true,
        lastGuessCount: 2,
        lastHintsUsed: 0,
        lastDifficulty: 'normal',
        isDaily: false,
      });
    });

    expect(result.current.newUnlocked).toHaveLength(1);

    act(() => {
      result.current.dismissNewUnlocked();
    });

    expect(result.current.newUnlocked).toHaveLength(0);
  });

  it('should call addPlayedCategory and update state on trackCategory', async () => {
    const { result } = renderHook(() => useAchievements());

    await waitFor(() => {
      expect(result.current.achievements).toHaveLength(3);
    });

    await act(async () => {
      await result.current.trackCategory('food');
    });

    expect(storage.addPlayedCategory).toHaveBeenCalledWith('food');
    expect(result.current.achievements).toHaveLength(3); // unchanged
  });
});
