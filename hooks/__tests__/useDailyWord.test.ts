import { renderHook, act } from '@testing-library/react-native';
import { useDailyWord } from '../useDailyWord';

jest.mock('../../services/storage', () => ({
  loadDailyState: jest.fn().mockResolvedValue(null),
  saveDailyState: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/daily-word', () => ({
  getDailyWord: jest.fn().mockReturnValue({
    word: 'HELLO',
    meaning: '안녕',
    pronunciation: '헬로',
    example: 'Hello world!',
  }),
  getTodayString: jest.fn().mockReturnValue('2026-03-10'),
  getTimeUntilMidnight: jest.fn().mockReturnValue({ hours: 5, minutes: 30, seconds: 0 }),
}));

describe('useDailyWord', () => {
  it('should return daily word for given difficulty', () => {
    const { result } = renderHook(() => useDailyWord('normal'));
    expect(result.current.dailyWord.word).toBe('HELLO');
  });

  it('should start with dailyCompleted false', () => {
    const { result } = renderHook(() => useDailyWord('normal'));
    expect(result.current.dailyCompleted).toBe(false);
  });

  it('should mark daily complete', async () => {
    const { result } = renderHook(() => useDailyWord('normal'));

    await act(async () => {
      await result.current.markDailyComplete(true, ['HELLO']);
    });

    expect(result.current.dailyCompleted).toBe(true);
    expect(result.current.dailyWon).toBe(true);
  });
});
