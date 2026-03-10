import type { ReviewEntry, ReviewStatus } from '../src/types/review';

const BASE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function calculateNextReview(entry: ReviewEntry): ReviewEntry {
  const now = Date.now();
  const interval = BASE_INTERVAL_MS * Math.pow(2, entry.reviewCount);
  const nextReview = now + interval;

  let status: ReviewStatus = 'learning';
  if (entry.reviewCount >= 5) {
    status = 'mastered';
  }

  return {
    ...entry,
    lastReviewed: now,
    reviewCount: entry.reviewCount + 1,
    nextReview,
    status,
  };
}

export function isWordDue(entry: ReviewEntry): boolean {
  return Date.now() >= entry.nextReview;
}

export function createReviewEntry(word: string): ReviewEntry {
  return {
    word,
    lastReviewed: Date.now(),
    reviewCount: 0,
    nextReview: Date.now() + BASE_INTERVAL_MS,
    status: 'new',
  };
}

export function getDueWords(entries: ReviewEntry[]): ReviewEntry[] {
  return entries.filter(isWordDue).sort((a, b) => a.nextReview - b.nextReview);
}
