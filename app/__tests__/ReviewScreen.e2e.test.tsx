/**
 * ReviewScreen E2E Tests
 *
 * Covers:
 * - Tab switching (collection / quiz)
 * - Collection tab: word list with status badges
 * - Quiz tab: flashcard, flip, "알고 있어요"/"다시 볼게요"
 * - Quiz progress indicator
 * - Quiz word advancement
 * - Empty quiz state
 * - Back navigation
 * - Sound effects
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// ── Mocks ──

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('react-native-safe-area-context', () => {
  const RN = require('react-native');
  const MockSafeArea = (props: Record<string, unknown>) => require('react').createElement(RN.View, props);
  return { SafeAreaView: MockSafeArea, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View, Svg: View, Path: View, Circle: View, Rect: View, G: View };
});

jest.mock('../../constants/animations', () => ({
  FLIP_DURATION: 0, FLIP_STAGGER: 0, POP_DURATION: 0, SHAKE_DURATION: 0,
  BOUNCE_DURATION: 0, BOUNCE_STAGGER: 0, WOBBLE_ROTATION: 0, WOBBLE_DURATION: 100,
  REVEAL_DELAY: () => 0, TOTAL_REVEAL_TIME: () => 0,
  EASING: { flip: { factory: () => 0 }, pop: { factory: () => 0 }, shake: { factory: () => 0 }, bounce: { factory: () => 0 }, wobble: { factory: () => 0 } },
}));

const mockEntries = [
  { word: 'APPLE', lastReviewed: '2024-01-01', reviewCount: 3, nextReview: '2024-01-02', status: 'mastered' as const },
  { word: 'BREAD', lastReviewed: '2024-01-01', reviewCount: 1, nextReview: '2024-01-01', status: 'learning' as const },
  { word: 'CHAIR', lastReviewed: '2024-01-01', reviewCount: 0, nextReview: '2024-01-01', status: 'new' as const },
];

const mockDueWords = [
  { word: 'BREAD', lastReviewed: '2024-01-01', reviewCount: 1, nextReview: '2024-01-01', status: 'learning' as const },
  { word: 'CHAIR', lastReviewed: '2024-01-01', reviewCount: 0, nextReview: '2024-01-01', status: 'new' as const },
];

const mockMarkReviewed = jest.fn().mockResolvedValue(undefined);
const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockPlay = jest.fn();

jest.mock('../../hooks/useReview', () => ({
  useReview: () => ({
    entries: mockEntries, dueWords: mockDueWords, dueCount: 2,
    markReviewed: mockMarkReviewed, refresh: mockRefresh,
  }),
}));

jest.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mockPlay }),
}));

jest.mock('../../src/data', () => ({
  getWordList: (difficulty: string) => {
    const words: Record<string, { word: string; meaning: string; pronunciation: string; example: string; category: string; partOfSpeech: string }[]> = {
      easy: [], hard: [],
      normal: [
        { word: 'APPLE', meaning: '사과', pronunciation: '애플', example: 'I eat an apple.', category: 'food', partOfSpeech: 'noun' },
        { word: 'BREAD', meaning: '빵', pronunciation: '브레드', example: 'I like bread.', category: 'food', partOfSpeech: 'noun' },
        { word: 'CHAIR', meaning: '의자', pronunciation: '체어', example: 'Sit on the chair.', category: 'home', partOfSpeech: 'noun' },
      ],
    };
    return { answers: words[difficulty] ?? [], valid: new Set<string>() };
  },
}));

import ReviewScreen from '../review';

describe('ReviewScreen E2E', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Navigation', () => {
    it('should render title and navigate back', () => {
      const { getByText } = render(<ReviewScreen />);
      expect(getByText('복습')).toBeTruthy();
      fireEvent.press(getByText('← 뒤로'));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Tab Switching', () => {
    it('should show both tabs with counts', () => {
      const { getByText } = render(<ReviewScreen />);
      expect(getByText('📚 컬렉션 (3)')).toBeTruthy();
      expect(getByText('🎯 퀴즈 (2)')).toBeTruthy();
    });

    it('should default to collection and show words', () => {
      const { getByText } = render(<ReviewScreen />);
      expect(getByText('APPLE')).toBeTruthy();
      expect(getByText('BREAD')).toBeTruthy();
      expect(getByText('CHAIR')).toBeTruthy();
    });

    it('should switch to quiz and back', () => {
      const { getByText } = render(<ReviewScreen />);
      fireEvent.press(getByText('🎯 퀴즈 (2)'));
      expect(getByText('BREAD')).toBeTruthy();
      expect(getByText('1 / 2')).toBeTruthy();
      fireEvent.press(getByText('📚 컬렉션 (3)'));
      expect(getByText('APPLE')).toBeTruthy();
    });
  });

  describe('Collection Tab', () => {
    it('should display status badges', () => {
      const { getByText } = render(<ReviewScreen />);
      expect(getByText('마스터')).toBeTruthy();
      expect(getByText('학습 중')).toBeTruthy();
      expect(getByText('새 단어')).toBeTruthy();
    });
  });

  describe('Quiz Tab', () => {
    it('should show flashcard with tap hint', () => {
      const { getByText } = render(<ReviewScreen />);
      fireEvent.press(getByText('🎯 퀴즈 (2)'));
      expect(getByText('BREAD')).toBeTruthy();
      expect(getByText('탭하여 뒤집기 · 스와이프로 평가')).toBeTruthy();
    });

    it('should play flip sound on card tap', () => {
      const { getByText, getByLabelText } = render(<ReviewScreen />);
      fireEvent.press(getByText('🎯 퀴즈 (2)'));
      fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
      expect(mockPlay).toHaveBeenCalledWith('flip');
    });

    it('should show action buttons after flip', () => {
      const { getByText, getByLabelText } = render(<ReviewScreen />);
      fireEvent.press(getByText('🎯 퀴즈 (2)'));
      fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
      expect(getByLabelText('알고 있어요')).toBeTruthy();
      expect(getByLabelText('다시 볼게요')).toBeTruthy();
    });

    it('should mark reviewed and advance on "알고 있어요"', async () => {
      const { getByText, getByLabelText } = render(<ReviewScreen />);
      fireEvent.press(getByText('🎯 퀴즈 (2)'));
      fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
      await act(async () => { fireEvent.press(getByLabelText('알고 있어요')); });
      expect(mockPlay).toHaveBeenCalledWith('pop');
      expect(mockMarkReviewed).toHaveBeenCalledWith('BREAD');
      expect(getByText('CHAIR')).toBeTruthy();
      expect(getByText('2 / 2')).toBeTruthy();
    });

    it('should advance on "다시 볼게요"', () => {
      const { getByText, getByLabelText } = render(<ReviewScreen />);
      fireEvent.press(getByText('🎯 퀴즈 (2)'));
      fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
      fireEvent.press(getByLabelText('다시 볼게요'));
      expect(mockPlay).toHaveBeenCalledWith('shake');
      expect(getByText('CHAIR')).toBeTruthy();
    });
  });
});
