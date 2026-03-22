/**
 * PracticeScreen E2E Tests
 *
 * Covers:
 * - Empty state (no due words)
 * - Practice session initialization
 * - Progress indicator
 * - Game board and keyboard rendering
 * - Letter input, submission, backspace
 * - Toast messages
 * - Back navigation
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('../../constants/animations', () => ({
  FLIP_DURATION: 0, FLIP_STAGGER: 0, POP_DURATION: 0, SHAKE_DURATION: 0,
  BOUNCE_DURATION: 0, BOUNCE_STAGGER: 0, WOBBLE_ROTATION: 0, WOBBLE_DURATION: 100,
  REVEAL_DELAY: () => 0, TOTAL_REVEAL_TIME: () => 0,
  EASING: { flip: { factory: () => 0 }, pop: { factory: () => 0 }, shake: { factory: () => 0 }, bounce: { factory: () => 0 }, wobble: { factory: () => 0 } },
}));

const mockDueWords = [
  { word: 'BREAD', lastReviewed: '2024-01-01', reviewCount: 1, nextReview: '2024-01-01', status: 'learning' as const },
  { word: 'CHAIR', lastReviewed: '2024-01-01', reviewCount: 0, nextReview: '2024-01-01', status: 'new' as const },
];

const mockMarkReviewed = jest.fn().mockResolvedValue(undefined);
const mockPlay = jest.fn();

const mockGame = {
  gameStatus: 'playing' as 'playing' | 'won' | 'lost',
  guesses: [] as string[], evaluations: [] as ('correct' | 'present' | 'absent')[][],
  currentGuess: '', hints: [] as { type: string; content: string }[],
  hintsUsed: 0, hintPointsUsed: 0,
  keyStatuses: {} as Record<string, string>,
  isRevealing: false, isShaking: false, toastMessage: '',
  wordLength: 5, maxAttempts: 6,
  targetWord: { word: 'BREAD', meaning: '빵', pronunciation: '브레드', example: 'I like bread.', category: 'food' as const, partOfSpeech: 'noun' },
  addLetter: jest.fn(), removeLetter: jest.fn(), submitGuess: jest.fn(),
  requestHint: jest.fn(), newGame: jest.fn(), startWithWord: jest.fn(),
};

let mockCurrentDueWords = mockDueWords;
jest.mock('../../hooks/useReview', () => ({
  useReview: () => ({ dueWords: mockCurrentDueWords, markReviewed: mockMarkReviewed }),
}));

jest.mock('../../hooks/useSound', () => ({
  useSound: () => ({ play: mockPlay }),
}));

jest.mock('../../hooks/useGame', () => ({
  useGame: () => mockGame,
}));

jest.mock('../../src/data', () => ({
  getWordList: (difficulty: string) => {
    const words: Record<string, { word: string; meaning: string; pronunciation: string; example: string; category: string; partOfSpeech: string }[]> = {
      easy: [], hard: [],
      normal: [
        { word: 'BREAD', meaning: '빵', pronunciation: '브레드', example: 'I like bread.', category: 'food', partOfSpeech: 'noun' },
        { word: 'CHAIR', meaning: '의자', pronunciation: '체어', example: 'Sit on the chair.', category: 'home', partOfSpeech: 'noun' },
      ],
    };
    return { answers: words[difficulty] ?? [], valid: new Set<string>() };
  },
}));

import PracticeScreen from '../practice';

describe('PracticeScreen E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentDueWords = mockDueWords;
    mockGame.gameStatus = 'playing';
    mockGame.guesses = [];
    mockGame.currentGuess = '';
    mockGame.toastMessage = '';
  });

  describe('Empty State', () => {
    it('should show empty message when no due words', () => {
      mockCurrentDueWords = [];
      const { getByText } = render(<PracticeScreen />);
      expect(getByText('연습할 단어가 없어요')).toBeTruthy();
      expect(getByText('게임에서 단어를 학습하면 여기에 나타나요!')).toBeTruthy();
    });

    it('should navigate back from empty state', () => {
      mockCurrentDueWords = [];
      const { getByText } = render(<PracticeScreen />);
      fireEvent.press(getByText('← 뒤로'));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Practice Session', () => {
    it('should show progress indicator', () => {
      const { getByText } = render(<PracticeScreen />);
      expect(getByText('연습 1/2')).toBeTruthy();
    });

    it('should render game board', () => {
      const { getByLabelText } = render(<PracticeScreen />);
      expect(getByLabelText('game board')).toBeTruthy();
    });

    it('should handle letter input', () => {
      const { getByText } = render(<PracticeScreen />);
      fireEvent.press(getByText('A'));
      expect(mockPlay).toHaveBeenCalledWith('pop');
      expect(mockGame.addLetter).toHaveBeenCalledWith('A');
    });

    it('should handle submit and backspace', () => {
      const { getByLabelText } = render(<PracticeScreen />);
      fireEvent.press(getByLabelText('enter'));
      expect(mockGame.submitGuess).toHaveBeenCalled();
      fireEvent.press(getByLabelText('backspace'));
      expect(mockGame.removeLetter).toHaveBeenCalled();
    });

    it('should navigate back', () => {
      const { getByText } = render(<PracticeScreen />);
      fireEvent.press(getByText('← 뒤로'));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Toast Messages', () => {
    it('should display and hide toast', () => {
      mockGame.toastMessage = '유효하지 않은 단어예요';
      const { getByText } = render(<PracticeScreen />);
      expect(getByText('유효하지 않은 단어예요')).toBeTruthy();

      mockGame.toastMessage = '';
      const { queryByText } = render(<PracticeScreen />);
      expect(queryByText('유효하지 않은 단어예요')).toBeNull();
    });
  });
});
