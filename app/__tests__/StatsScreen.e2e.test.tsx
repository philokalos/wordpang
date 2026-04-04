/**
 * StatsScreen E2E Tests
 *
 * Covers:
 * - Stats display (total played, win rate, streaks)
 * - Achievement badge rendering and count
 * - Category progress display (all 8 categories)
 * - Backup panel (summary, export, import modal)
 * - Back navigation
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

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

jest.mock('react-native/Libraries/Share/Share', () => ({ share: jest.fn() }));

jest.mock('../../constants/animations', () => ({
  FLIP_DURATION: 0, FLIP_STAGGER: 0, POP_DURATION: 0, SHAKE_DURATION: 0,
  BOUNCE_DURATION: 0, BOUNCE_STAGGER: 0, WOBBLE_ROTATION: 0, WOBBLE_DURATION: 100,
  REVEAL_DELAY: () => 0, TOTAL_REVEAL_TIME: () => 0,
  EASING: { flip: { factory: () => 0 }, pop: { factory: () => 0 }, shake: { factory: () => 0 }, bounce: { factory: () => 0 }, wobble: { factory: () => 0 } },
}));

jest.mock('../../hooks/useStats', () => ({
  useStats: () => ({
    stats: {
      totalPlayed: 42, totalWon: 35, currentStreak: 5, maxStreak: 12,
      guessDistribution: { 1: 2, 2: 5, 3: 10, 4: 12, 5: 4, 6: 2 },
      difficultyStats: {},
    },
    winRate: 83,
  }),
}));

jest.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({
    achievements: [
      { id: 'first_win', title: '첫 승리!', description: '처음으로 단어를 맞혔어요', icon: '🏆', unlockedAt: '2024-01-01' },
      { id: 'streak_3', title: '3일 연속!', description: '3일 연속 게임에 성공했어요', icon: '🔥', unlockedAt: '2024-01-03' },
      { id: 'streak_7', title: '7일 연속!', description: '7일 연속 게임에 성공했어요', icon: '💪' },
    ],
    unlockedCount: 2, totalCount: 3,
  }),
}));

jest.mock('../../services/storage', () => ({
  loadLearnedWords: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../services/backup', () => ({
  exportAllData: jest.fn().mockResolvedValue('{"test":"data"}'),
  importAllData: jest.fn().mockResolvedValue(true),
  getBackupSummary: jest.fn().mockResolvedValue({ totalGames: 42, learnedWords: 15, achievements: 2 }),
}));

import StatsScreen from '../stats';

describe('StatsScreen E2E', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Navigation', () => {
    it('should render title and back button', () => {
      const { getByText } = render(<StatsScreen />);
      expect(getByText('통계')).toBeTruthy();
      fireEvent.press(getByText('← 뒤로'));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Stats Display', () => {
    it('should display stats values', () => {
      const { getByText, getAllByText } = render(<StatsScreen />);
      expect(getByText('42')).toBeTruthy();
      expect(getByText('83%')).toBeTruthy();
      // Numbers can appear in both summary stats and guess distribution
      expect(getAllByText('5').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('12').length).toBeGreaterThanOrEqual(1);
    });

    it('should display guess distribution section', () => {
      const { getByText } = render(<StatsScreen />);
      expect(getByText('추측 분포')).toBeTruthy();
    });
  });

  describe('Achievement Badges', () => {
    it('should display badge count and all badges', () => {
      const { getByText } = render(<StatsScreen />);
      expect(getByText('배지 (2/3)')).toBeTruthy();
      expect(getByText('첫 승리!')).toBeTruthy();
      expect(getByText('3일 연속!')).toBeTruthy();
      expect(getByText('7일 연속!')).toBeTruthy();
    });
  });

  describe('Category Progress', () => {
    it('should render all 8 categories', async () => {
      const { getByText } = render(<StatsScreen />);
      await waitFor(() => {
        expect(getByText('카테고리 진행')).toBeTruthy();
        expect(getByText('동물')).toBeTruthy();
        expect(getByText('음식')).toBeTruthy();
        expect(getByText('학교')).toBeTruthy();
        expect(getByText('자연')).toBeTruthy();
        expect(getByText('신체')).toBeTruthy();
        expect(getByText('생활')).toBeTruthy();
        expect(getByText('동작')).toBeTruthy();
        expect(getByText('감정')).toBeTruthy();
      });
    });
  });

  describe('Backup Panel', () => {
    it('should show export and import buttons', () => {
      const { getByLabelText } = render(<StatsScreen />);
      expect(getByLabelText('단어장 저장하기')).toBeTruthy();
      expect(getByLabelText('단어장 불러오기')).toBeTruthy();
    });

    it('should display backup summary', async () => {
      const { getByText } = render(<StatsScreen />);
      await waitFor(() => {
        expect(getByText('총 게임: 42회')).toBeTruthy();
        expect(getByText('학습 단어: 15개')).toBeTruthy();
        expect(getByText('획득 배지: 2개')).toBeTruthy();
      });
    });

    it('should show import modal and close it', () => {
      const { getByLabelText } = render(<StatsScreen />);
      fireEvent.press(getByLabelText('단어장 불러오기'));
      expect(getByLabelText('백업 데이터 입력')).toBeTruthy();
      fireEvent.press(getByLabelText('취소'));
      expect(getByLabelText('단어장 저장하기')).toBeTruthy();
    });
  });
});
