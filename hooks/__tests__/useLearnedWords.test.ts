import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLearnedWords } from '../useLearnedWords';

const mockLearnedWords = [
  { word: 'apple', firstSeen: 1000, timesCorrect: 2 },
  { word: 'brain', firstSeen: 2000, timesCorrect: 1 },
];

jest.mock('../../services/storage', () => ({
  loadLearnedWords: jest.fn().mockResolvedValue([
    { word: 'apple', firstSeen: 1000, timesCorrect: 2 },
    { word: 'brain', firstSeen: 2000, timesCorrect: 1 },
  ]),
  markWordLearned: jest.fn().mockResolvedValue([
    { word: 'apple', firstSeen: 1000, timesCorrect: 2 },
    { word: 'brain', firstSeen: 2000, timesCorrect: 1 },
    { word: 'chess', firstSeen: 3000, timesCorrect: 1 },
  ]),
}));

const { loadLearnedWords, markWordLearned } = require('../../services/storage') as {
  loadLearnedWords: jest.Mock;
  markWordLearned: jest.Mock;
};

describe('useLearnedWords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadLearnedWords.mockResolvedValue(mockLearnedWords);
    markWordLearned.mockResolvedValue([
      ...mockLearnedWords,
      { word: 'chess', firstSeen: 3000, timesCorrect: 1 },
    ]);
  });

  it('should call loadLearnedWords on mount and set state', async () => {
    const { result } = renderHook(() => useLearnedWords());

    await waitFor(() => {
      expect(result.current.learnedWords).toHaveLength(2);
    });

    expect(loadLearnedWords).toHaveBeenCalledTimes(1);
    expect(result.current.learnedWords[0].word).toBe('apple');
  });

  it('should return correct learnedCount', async () => {
    const { result } = renderHook(() => useLearnedWords());

    await waitFor(() => {
      expect(result.current.learnedCount).toBe(2);
    });
  });

  it('should call markWordLearned and update state on markLearned', async () => {
    const { result } = renderHook(() => useLearnedWords());

    await waitFor(() => {
      expect(result.current.learnedWords).toHaveLength(2);
    });

    await act(async () => {
      await result.current.markLearned('chess');
    });

    expect(markWordLearned).toHaveBeenCalledWith('chess');
    expect(result.current.learnedWords).toHaveLength(3);
    expect(result.current.learnedCount).toBe(3);
  });

  it('should start with empty learnedWords before load resolves', () => {
    loadLearnedWords.mockImplementation(() => new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useLearnedWords());
    expect(result.current.learnedWords).toEqual([]);
    expect(result.current.learnedCount).toBe(0);
  });
});
