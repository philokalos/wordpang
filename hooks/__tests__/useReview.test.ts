import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReview } from '../useReview';
import type { ReviewEntry } from '../../src/types/review';

const now = Date.now();

const entry1: ReviewEntry = {
  word: 'apple',
  lastReviewed: now - 10000,
  reviewCount: 1,
  nextReview: now - 1000, // due
  status: 'learning',
};
const entry2: ReviewEntry = {
  word: 'brain',
  lastReviewed: now - 5000,
  reviewCount: 0,
  nextReview: now + 60000, // not due
  status: 'new',
};

jest.mock('../../services/storage', () => ({
  loadReviewEntries: jest.fn(),
  saveReviewEntry: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../services/spaced-repetition', () => ({
  getDueWords: jest.fn(),
  createReviewEntry: jest.fn(),
  calculateNextReview: jest.fn(),
}));

const storage = require('../../services/storage') as {
  loadReviewEntries: jest.Mock;
  saveReviewEntry: jest.Mock;
};

const spacedRep = require('../../services/spaced-repetition') as {
  getDueWords: jest.Mock;
  createReviewEntry: jest.Mock;
  calculateNextReview: jest.Mock;
};

describe('useReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.loadReviewEntries.mockResolvedValue([entry1, entry2]);
    spacedRep.getDueWords.mockReturnValue([entry1]);
    spacedRep.createReviewEntry.mockImplementation((word: string): ReviewEntry => ({
      word,
      lastReviewed: now,
      reviewCount: 0,
      nextReview: now + 30 * 60 * 1000,
      status: 'new',
    }));
    spacedRep.calculateNextReview.mockImplementation((entry: ReviewEntry): ReviewEntry => ({
      ...entry,
      reviewCount: entry.reviewCount + 1,
      lastReviewed: now,
      nextReview: now + 60 * 60 * 1000,
      status: 'learning',
    }));
  });

  it('should load entries and dueWords on mount', async () => {
    const { result } = renderHook(() => useReview());

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    });

    expect(storage.loadReviewEntries).toHaveBeenCalledTimes(1);
    expect(result.current.dueCount).toBe(1);
  });

  it('should ignore addWord when word already exists', async () => {
    const { result } = renderHook(() => useReview());

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    });

    await act(async () => {
      await result.current.addWord('apple'); // already exists
    });

    expect(spacedRep.createReviewEntry).not.toHaveBeenCalled();
    expect(storage.saveReviewEntry).not.toHaveBeenCalled();
  });

  it('should add new word and refresh', async () => {
    const newEntry: ReviewEntry = {
      word: 'chess',
      lastReviewed: now,
      reviewCount: 0,
      nextReview: now + 30 * 60 * 1000,
      status: 'new',
    };
    spacedRep.createReviewEntry.mockReturnValue(newEntry);
    storage.loadReviewEntries.mockResolvedValueOnce([entry1, entry2])
      .mockResolvedValueOnce([entry1, entry2, newEntry]);
    spacedRep.getDueWords.mockReturnValueOnce([entry1]).mockReturnValueOnce([entry1]);

    const { result } = renderHook(() => useReview());

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    });

    await act(async () => {
      await result.current.addWord('chess');
    });

    expect(spacedRep.createReviewEntry).toHaveBeenCalledWith('chess');
    expect(storage.saveReviewEntry).toHaveBeenCalledWith(newEntry);
    expect(result.current.totalCount).toBe(3);
  });

  it('should ignore markReviewed for unknown word', async () => {
    const { result } = renderHook(() => useReview());

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    });

    await act(async () => {
      await result.current.markReviewed('unknown');
    });

    expect(spacedRep.calculateNextReview).not.toHaveBeenCalled();
    expect(storage.saveReviewEntry).not.toHaveBeenCalled();
  });

  it('should update entry and refresh on markReviewed', async () => {
    const updatedEntry: ReviewEntry = { ...entry1, reviewCount: 2, status: 'learning' };
    spacedRep.calculateNextReview.mockReturnValue(updatedEntry);
    storage.loadReviewEntries
      .mockResolvedValueOnce([entry1, entry2])
      .mockResolvedValueOnce([updatedEntry, entry2]);
    spacedRep.getDueWords.mockReturnValueOnce([entry1]).mockReturnValueOnce([]);

    const { result } = renderHook(() => useReview());

    await waitFor(() => {
      expect(result.current.dueCount).toBe(1);
    });

    await act(async () => {
      await result.current.markReviewed('apple');
    });

    expect(spacedRep.calculateNextReview).toHaveBeenCalledWith(entry1);
    expect(storage.saveReviewEntry).toHaveBeenCalledWith(updatedEntry);
    expect(result.current.dueCount).toBe(0);
  });

  it('should compute dueCount and totalCount correctly', async () => {
    storage.loadReviewEntries.mockResolvedValue([entry1, entry2]);
    spacedRep.getDueWords.mockReturnValue([entry1]);

    const { result } = renderHook(() => useReview());

    await waitFor(() => {
      expect(result.current.totalCount).toBe(2);
    });

    expect(result.current.dueCount).toBe(1);
    expect(result.current.totalCount).toBe(2);
  });
});
