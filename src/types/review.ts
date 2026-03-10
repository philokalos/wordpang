export type ReviewStatus = 'new' | 'learning' | 'mastered';

export interface ReviewEntry {
  word: string;
  lastReviewed: number;
  reviewCount: number;
  nextReview: number;
  status: ReviewStatus;
}
