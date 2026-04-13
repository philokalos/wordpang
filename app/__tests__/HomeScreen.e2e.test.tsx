/**
 * HomeScreen E2E Tests
 *
 * Covers:
 * - Onboarding redirect for first-time users
 * - Difficulty selection (easy/normal/hard)
 * - Category filter section
 * - Daily mode toggle
 * - Navigation to review/practice/stats
 * - Start game with correct params
 * - Streak badge display
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Switch } from 'react-native';

// ── Mocks ──

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
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

const mockStats = {
  stats: {
    totalPlayed: 0, totalWon: 0, currentStreak: 0, maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    difficultyStats: {},
  },
  winRate: 0, record: jest.fn(), getDifficultyRecommendation: jest.fn(),
};

const mockOnboarding = {
  isLoading: false,
  isOnboardingDone: true,
  completeOnboarding: jest.fn(),
};

jest.mock('../../hooks/useStats', () => ({ useStats: () => mockStats }));
jest.mock('../../hooks/useOnboarding', () => ({ useOnboarding: () => mockOnboarding }));
jest.mock('../../hooks/useReview', () => ({ useReview: () => ({ dueCount: 0 }) }));
jest.mock('../../services/storage', () => ({ canRecoverStreak: jest.fn().mockResolvedValue(false) }));

import HomeScreen from '../index';

describe('HomeScreen E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnboarding.isLoading = false;
    mockOnboarding.isOnboardingDone = true;
    mockStats.stats.currentStreak = 0;
  });

  // ── Onboarding Redirect ──

  describe('Onboarding Redirect', () => {
    it('should redirect to onboarding when not completed', () => {
      mockOnboarding.isOnboardingDone = false;
      render(<HomeScreen />);
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });

    it('should not redirect when onboarding is completed', () => {
      render(<HomeScreen />);
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should render nothing while loading onboarding state', () => {
      mockOnboarding.isLoading = true;
      const { toJSON } = render(<HomeScreen />);
      expect(toJSON()).toBeNull();
    });
  });

  // ── Difficulty Selection ──

  describe('Difficulty Selection', () => {
    it('should render all three difficulty options', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('Easy')).toBeTruthy();
      expect(getByText('Normal')).toBeTruthy();
      expect(getByText('Hard')).toBeTruthy();
    });

    it('should default to normal difficulty', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('시작하기'));
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ params: expect.objectContaining({ difficulty: 'normal' }) }),
      );
    });

    it('should start game with easy difficulty when selected', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('Easy'));
      fireEvent.press(getByText('시작하기'));
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ params: expect.objectContaining({ difficulty: 'easy' }) }),
      );
    });

    it('should start game with hard difficulty when selected', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('Hard'));
      fireEvent.press(getByText('시작하기'));
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ params: expect.objectContaining({ difficulty: 'hard' }) }),
      );
    });
  });

  // ── Daily Mode ──

  describe('Daily Mode Toggle', () => {
    it('should render daily mode toggle', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('오늘의 단어 모드')).toBeTruthy();
    });

    it('should start with daily mode off (daily=0)', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('시작하기'));
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ params: expect.objectContaining({ daily: '0' }) }),
      );
    });

    it('should pass daily=1 when daily mode is toggled on', () => {
      const { getByText, UNSAFE_getByType } = render(<HomeScreen />);
      fireEvent(UNSAFE_getByType(Switch), 'valueChange', true);
      fireEvent.press(getByText('시작하기'));
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ params: expect.objectContaining({ daily: '1' }) }),
      );
    });
  });

  // ── Navigation ──

  describe('Navigation', () => {
    it('should navigate to review screen', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('복습'));
      expect(mockPush).toHaveBeenCalledWith('/review');
    });

    it('should navigate to practice screen', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('연습'));
      expect(mockPush).toHaveBeenCalledWith('/practice');
    });

    it('should navigate to stats screen', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('통계'));
      expect(mockPush).toHaveBeenCalledWith('/stats');
    });

    it('should navigate to game screen with correct pathname', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('시작하기'));
      expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/game' }));
    });
  });

  // ── Streak Badge ──

  describe('Streak Badge', () => {
    it('should not show streak badge when streak is 0', () => {
      const { queryByText } = render(<HomeScreen />);
      expect(queryByText(/일 연속/)).toBeNull();
    });

    it('should show streak badge when streak > 0', () => {
      mockStats.stats.currentStreak = 5;
      const { getByText } = render(<HomeScreen />);
      expect(getByText(/5일 연속/)).toBeTruthy();
    });
  });

  // ── Category Filter ──

  describe('Category Filter', () => {
    it('should render category section', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('주제 선택')).toBeTruthy();
    });

    it('should start game without category param by default', () => {
      const { getByText } = render(<HomeScreen />);
      fireEvent.press(getByText('시작하기'));
      const callArgs = mockPush.mock.calls[0][0];
      expect(callArgs.params.category).toBeUndefined();
    });
  });

  // ── UI Elements ──

  describe('UI Elements', () => {
    it('should display difficulty selection label', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('난이도를 선택하세요!')).toBeTruthy();
    });

    it('should display start button', () => {
      const { getByText } = render(<HomeScreen />);
      expect(getByText('시작하기')).toBeTruthy();
    });
  });
});
