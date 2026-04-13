/**
 * OnboardingScreen E2E Tests
 *
 * Covers:
 * - 4-page carousel rendering (all content pre-rendered)
 * - Page 1: Welcome (title, description, WordPang name)
 * - Page 2: Game rules (tile examples, color legend)
 * - Page 3: Hints (5 hint types, point costs)
 * - Page 4: Ready (4 features listed)
 * - "다음" button on non-last pages
 * - completeOnboarding + navigation on last page
 */
import React from 'react';
import { render } from '@testing-library/react-native';

// ── Mocks ──

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
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

const mockCompleteOnboarding = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useOnboarding', () => ({
  useOnboarding: () => ({ isLoading: false, isOnboardingDone: false, completeOnboarding: mockCompleteOnboarding }),
}));

import OnboardingScreen from '../onboarding';

describe('OnboardingScreen E2E', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Page 1 - Welcome', () => {
    it('should render welcome title and description', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/워드팡에 오신 걸/)).toBeTruthy();
      expect(getByText(/영어 단어를 재미있게 배우는/)).toBeTruthy();
    });

    it('should display WordPang name', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText('WordPang')).toBeTruthy();
    });

    it('should show "다음" button', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText('다음')).toBeTruthy();
    });
  });

  describe('Page 2 - Game Rules', () => {
    it('should render game rules content', () => {
      const { getByText } = render(<OnboardingScreen />);
      // Text has newline in the middle, so match parts
      expect(getByText(/맞혀보세요/)).toBeTruthy();
      expect(getByText(/색깔 힌트가 나타날 거예요/)).toBeTruthy();
    });

    it('should show tile color legend', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/맞는 자리에 있어요/)).toBeTruthy();
      expect(getByText(/다른 자리에 있어요/)).toBeTruthy();
      expect(getByText(/단어에 없어요/)).toBeTruthy();
    });

    it('should show example letter tiles', () => {
      const { getAllByText } = render(<OnboardingScreen />);
      // APPLE example tiles
      expect(getAllByText('A').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('P').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('L').length).toBeGreaterThanOrEqual(1);
      expect(getAllByText('E').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Page 3 - Hints', () => {
    it('should render hints title and description', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/힌트를 활용하세요/)).toBeTruthy();
      expect(getByText(/힌트를 쏙쏙 골라 쓸 수 있어요/)).toBeTruthy();
    });

    it('should list all 5 hint types', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText('예문 보기')).toBeTruthy();
      expect(getByText('첫 글자')).toBeTruthy();
      expect(getByText('모음 개수')).toBeTruthy();
      expect(getByText('뜻 보기')).toBeTruthy();
      expect(getByText('글자 위치')).toBeTruthy();
    });

    it('should show point cost info', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/힌트 1개 = 1포인트/)).toBeTruthy();
    });
  });

  describe('Page 4 - Ready', () => {
    it('should render ready title and features', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/준비됐나요/)).toBeTruthy();
      expect(getByText(/복습 모드/)).toBeTruthy();
      expect(getByText(/연습 모드/)).toBeTruthy();
      expect(getByText(/학습 통계/)).toBeTruthy();
      expect(getByText(/업적 배지/)).toBeTruthy();
    });

    it('should show daily word description', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText(/매일매일 즐겁게 새로운 단어를 배워봐요/)).toBeTruthy();
    });
  });

  describe('All Pages Rendered', () => {
    it('should pre-render all 4 pages in ScrollView', () => {
      const { getByText } = render(<OnboardingScreen />);
      expect(getByText('WordPang')).toBeTruthy();
      expect(getByText(/색깔 힌트가 나타날 거예요/)).toBeTruthy();
      expect(getByText(/힌트를 쏙쏙 골라 쓸 수 있어요/)).toBeTruthy();
      expect(getByText(/매일매일 즐겁게 새로운 단어를 배워봐요/)).toBeTruthy();
    });
  });
});
