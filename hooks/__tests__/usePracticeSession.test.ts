import { renderHook, act } from '@testing-library/react-native';
import { usePracticeSession } from '../usePracticeSession';
import type { ReviewEntry } from '../../src/types/review';
import type { WordEntry } from '../../src/types/word';

const now = Date.now();

const makeEntry = (word: string): ReviewEntry => ({
  word,
  lastReviewed: now - 10000,
  reviewCount: 1,
  nextReview: now - 1000,
  status: 'learning',
});

const mockWordEntries: WordEntry[] = [
  { word: 'apple', meaning: '사과', pronunciation: '/ˈæp.əl/', example: 'I eat an apple.', category: 'food', partOfSpeech: 'noun' },
  { word: 'brain', meaning: '뇌', pronunciation: '/breɪn/', example: 'Use your brain.', category: 'body', partOfSpeech: 'noun' },
  { word: 'chest', meaning: '가슴', pronunciation: '/tʃest/', example: 'He hurt his chest.', category: 'body', partOfSpeech: 'noun' },
];

jest.mock('../../src/data', () => ({
  getWordList: jest.fn().mockReturnValue({
    answers: [
      { word: 'apple', meaning: '사과', pronunciation: '/ˈæp.əl/', example: 'I eat an apple.', category: 'food', partOfSpeech: 'noun' },
      { word: 'brain', meaning: '뇌', pronunciation: '/breɪn/', example: 'Use your brain.', category: 'body', partOfSpeech: 'noun' },
      { word: 'chest', meaning: '가슴', pronunciation: '/tʃest/', example: 'He hurt his chest.', category: 'body', partOfSpeech: 'noun' },
    ],
    validWords: new Set(['apple', 'brain', 'chest']),
  }),
}));

describe('usePracticeSession', () => {
  const dueWords = ['apple', 'brain', 'chest'].map(makeEntry);

  it('should limit sessionWords to 5', () => {
    const manyDue = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map(makeEntry);
    const { result } = renderHook(() => usePracticeSession(manyDue, 'normal'));
    expect(result.current.totalWords).toBe(5);
  });

  it('should start at index 0 with currentWord as first dueWord', () => {
    const { result } = renderHook(() => usePracticeSession(dueWords, 'normal'));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentWord?.word).toBe('apple');
  });

  it('should advance currentIndex on recordResult', () => {
    const { result } = renderHook(() => usePracticeSession(dueWords, 'normal'));

    act(() => {
      result.current.recordResult('apple', true, 2);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.results).toHaveLength(1);
  });

  it('should set isComplete when last word is recorded', () => {
    const twoWords = [makeEntry('apple'), makeEntry('brain')];
    const { result } = renderHook(() => usePracticeSession(twoWords, 'normal'));

    act(() => {
      result.current.recordResult('apple', true, 1);
    });
    expect(result.current.isComplete).toBe(false);

    act(() => {
      result.current.recordResult('brain', false, 6);
    });
    expect(result.current.isComplete).toBe(true);
  });

  it('should count correctCount accurately', () => {
    const twoWords = [makeEntry('apple'), makeEntry('brain')];
    const { result } = renderHook(() => usePracticeSession(twoWords, 'normal'));

    act(() => {
      result.current.recordResult('apple', true, 2);
    });
    act(() => {
      result.current.recordResult('brain', false, 6);
    });

    expect(result.current.correctCount).toBe(1);
  });

  it('should reset state on reset()', () => {
    const { result } = renderHook(() => usePracticeSession(dueWords, 'normal'));

    act(() => {
      result.current.recordResult('apple', true, 2);
    });
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.results).toHaveLength(0);
    expect(result.current.isComplete).toBe(false);
  });

  it('should find WordEntry by word via findWordEntry', () => {
    const { result } = renderHook(() => usePracticeSession(dueWords, 'normal'));
    const entry = result.current.findWordEntry('apple');
    expect(entry).toBeDefined();
    expect(entry?.meaning).toBe('사과');
  });

  it('should return undefined for unknown word in findWordEntry', () => {
    const { result } = renderHook(() => usePracticeSession(dueWords, 'normal'));
    const entry = result.current.findWordEntry('zzzzz');
    expect(entry).toBeUndefined();
  });

  it('should handle empty dueWords', () => {
    const { result } = renderHook(() => usePracticeSession([], 'normal'));
    expect(result.current.totalWords).toBe(0);
    expect(result.current.currentWord).toBeUndefined();
  });

  // suppress unused import warning
  void mockWordEntries;
});
