import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStats } from '../useStats';

jest.mock('../../services/storage', () => ({
  loadStats: jest.fn().mockResolvedValue({
    totalPlayed: 10,
    totalWon: 7,
    currentStreak: 3,
    maxStreak: 5,
    guessDistribution: { 3: 2, 4: 3, 5: 2 },
  }),
  recordGame: jest.fn().mockResolvedValue({
    totalPlayed: 11,
    totalWon: 8,
    currentStreak: 4,
    maxStreak: 5,
    guessDistribution: { 3: 2, 4: 4, 5: 2 },
  }),
}));

describe('useStats', () => {
  it('should load stats on mount', async () => {
    const { result } = renderHook(() => useStats());

    await waitFor(() => {
      expect(result.current.stats.totalPlayed).toBe(10);
    });

    expect(result.current.stats.totalWon).toBe(7);
  });

  it('should update stats after record', async () => {
    const { result } = renderHook(() => useStats());

    await waitFor(() => {
      expect(result.current.stats.totalPlayed).toBe(10);
    });

    await act(async () => {
      await result.current.record(true, 4);
    });

    expect(result.current.stats.totalPlayed).toBe(11);
    expect(result.current.stats.totalWon).toBe(8);
  });

  it('should calculate winRate correctly', async () => {
    const { result } = renderHook(() => useStats());

    await waitFor(() => {
      expect(result.current.winRate).toBe(70); // 7/10 = 70%
    });
  });
});
