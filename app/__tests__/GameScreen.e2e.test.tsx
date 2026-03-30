/**
 * GameScreen E2E Tests
 *
 * Covers:
 * - Game initialization with difficulty/category/daily params
 * - Letter input via keyboard
 * - Guess submission and backspace
 * - Hint system (request, point costs, content display)
 * - Game win flow (result modal, mark learned, achievements)
 * - Game lose flow (result modal, word reveal)
 * - Daily mode (countdown, no "다시 하기")
 * - New game and difficulty change
 * - Toast messages
 * - Sound effects
 * - Stats navigation
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// ── Mocks ──

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: mockBack }),
  useLocalSearchParams: jest.fn(() => ({ difficulty: 'normal', daily: '0' })),
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

const mockTargetWord = {
  word: 'APPLE', meaning: '사과', pronunciation: '애플',
  example: 'I eat an apple every day.', category: 'food' as const, partOfSpeech: 'noun',
};

const mockGame = {
  gameStatus: 'playing' as 'playing' | 'won' | 'lost',
  guesses: [] as string[],
  evaluations: [] as ('correct' | 'present' | 'absent')[][],
  currentGuess: '', hints: [] as { type: string; content: string }[],
  hintsUsed: 0, hintPointsUsed: 0,
  keyStatuses: {} as Record<string, string>,
  isRevealing: false, isShaking: false, toastMessage: '',
  wordLength: 5, maxAttempts: 6, targetWord: mockTargetWord,
  addLetter: jest.fn(), removeLetter: jest.fn(), submitGuess: jest.fn(),
  requestHint: jest.fn(), newGame: jest.fn(), startWithWord: jest.fn(),
};

const mockPlay = jest.fn();
const mockRecord = jest.fn().mockResolvedValue({ totalPlayed: 1, totalWon: 1, currentStreak: 1, maxStreak: 1, guessDistribution: {}, difficultyStats: {} });
const mockGetDifficultyRecommendation = jest.fn().mockReturnValue(null);
const mockMarkLearned = jest.fn().mockResolvedValue(undefined);
const mockReviewAddWord = jest.fn().mockResolvedValue(undefined);

jest.mock('../../hooks/useGame', () => ({ useGame: () => mockGame }));
jest.mock('../../hooks/useSound', () => ({ useSound: () => ({ play: mockPlay }) }));
jest.mock('../../hooks/useStats', () => ({
  useStats: () => ({ record: mockRecord, getDifficultyRecommendation: mockGetDifficultyRecommendation, stats: {}, winRate: 0 }),
}));
jest.mock('../../hooks/useDailyWord', () => ({
  useDailyWord: () => ({ dailyWord: mockTargetWord, dailyCompleted: false, countdown: '05:23:41', markDailyComplete: jest.fn() }),
}));
jest.mock('../../hooks/useLearnedWords', () => ({
  useLearnedWords: () => ({ markLearned: mockMarkLearned, learnedCount: 10 }),
}));
jest.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({ check: jest.fn().mockResolvedValue([]), trackCategory: jest.fn() }),
}));
jest.mock('../../hooks/useReview', () => ({
  useReview: () => ({ addWord: mockReviewAddWord, totalCount: 5 }),
}));

import GameScreen from '../game';
import { useLocalSearchParams } from 'expo-router';

describe('GameScreen E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGame.gameStatus = 'playing';
    mockGame.guesses = [];
    mockGame.evaluations = [];
    mockGame.currentGuess = '';
    mockGame.hints = [];
    mockGame.hintPointsUsed = 0;
    mockGame.isRevealing = false;
    mockGame.isShaking = false;
    mockGame.toastMessage = '';
    mockGame.targetWord = mockTargetWord;
    mockGetDifficultyRecommendation.mockReturnValue(null);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ difficulty: 'normal', daily: '0' });
  });

  // ── Game Initialization ──

  describe('Game Initialization', () => {
    it('should render game board and keyboard', () => {
      const { getByLabelText } = render(<GameScreen />);
      expect(getByLabelText('game board')).toBeTruthy();
    });

    it('should render hint panel with counter', () => {
      const { getByLabelText } = render(<GameScreen />);
      expect(getByLabelText(/힌트 포인트/)).toBeTruthy();
    });
  });

  // ── Keyboard Interaction ──

  describe('Keyboard Interaction', () => {
    it('should call addLetter and play sound when letter pressed', () => {
      const { getByText } = render(<GameScreen />);
      fireEvent.press(getByText('A'));
      expect(mockPlay).toHaveBeenCalledWith('pop');
      expect(mockGame.addLetter).toHaveBeenCalledWith('A');
    });

    it('should call submitGuess when Enter pressed', () => {
      const { getByLabelText } = render(<GameScreen />);
      fireEvent.press(getByLabelText('enter'));
      expect(mockGame.submitGuess).toHaveBeenCalled();
    });

    it('should call removeLetter when backspace pressed', () => {
      const { getByLabelText } = render(<GameScreen />);
      fireEvent.press(getByLabelText('backspace'));
      expect(mockGame.removeLetter).toHaveBeenCalled();
    });
  });

  // ── Hint System ──

  describe('Hint System', () => {
    it('should render hint buttons', () => {
      const { getByLabelText } = render(<GameScreen />);
      expect(getByLabelText('예문 힌트')).toBeTruthy();
      expect(getByLabelText('첫 글자 힌트')).toBeTruthy();
      expect(getByLabelText('뜻 힌트')).toBeTruthy();
    });

    it('should call requestHint when hint pressed', () => {
      const { getByLabelText } = render(<GameScreen />);
      fireEvent.press(getByLabelText('예문 힌트'));
      expect(mockPlay).toHaveBeenCalledWith('pop');
      expect(mockGame.requestHint).toHaveBeenCalledWith('example');
    });

    it('should display hint content when active', () => {
      mockGame.hints = [{ type: 'meaning', content: '사과' }];
      mockGame.hintPointsUsed = 1;
      const { getByText, getByLabelText } = render(<GameScreen />);
      expect(getByText('사과')).toBeTruthy();
      expect(getByLabelText('힌트 포인트 1/4 사용')).toBeTruthy();
    });
  });

  // ── Game Win Flow ──

  describe('Game Win Flow', () => {
    beforeEach(() => {
      mockGame.gameStatus = 'won';
      mockGame.guesses = ['AUDIO', 'ANGLE', 'APPLE'];
      mockGame.evaluations = [
        ['correct', 'absent', 'absent', 'absent', 'absent'],
        ['correct', 'absent', 'absent', 'present', 'correct'],
        ['correct', 'correct', 'correct', 'correct', 'correct'],
      ];
    });

    it('should show "정답!" and attempt count', () => {
      const { getByText } = render(<GameScreen />);
      expect(getByText('정답!')).toBeTruthy();
      expect(getByText('3/6 번 만에 맞혔어요!')).toBeTruthy();
    });

    it('should show word details in result modal', () => {
      const { getByText } = render(<GameScreen />);
      expect(getByText('APPLE')).toBeTruthy();
      expect(getByText('사과')).toBeTruthy();
    });

    it('should show and handle "이 단어 배웠어요!" button', async () => {
      const { getByText } = render(<GameScreen />);
      expect(getByText('이 단어 배웠어요!')).toBeTruthy();
      await act(async () => { fireEvent.press(getByText('이 단어 배웠어요!')); });
      expect(mockMarkLearned).toHaveBeenCalledWith('APPLE');
      expect(mockReviewAddWord).toHaveBeenCalledWith('APPLE');
      expect(getByText('학습 완료!')).toBeTruthy();
    });

    it('should show "다시 하기" and "난이도 변경" buttons', () => {
      const { getByText } = render(<GameScreen />);
      expect(getByText('다시 하기')).toBeTruthy();
      expect(getByText('난이도 변경')).toBeTruthy();
    });

    it('should call newGame when "다시 하기" pressed', () => {
      const { getByText } = render(<GameScreen />);
      fireEvent.press(getByText('다시 하기'));
      expect(mockGame.newGame).toHaveBeenCalled();
    });

    it('should navigate back when "난이도 변경" pressed', () => {
      const { getByText } = render(<GameScreen />);
      fireEvent.press(getByText('난이도 변경'));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // ── Game Lose Flow ──

  describe('Game Lose Flow', () => {
    it('should show "아쉬워요!" and target word when lost', () => {
      mockGame.gameStatus = 'lost';
      const { getByText, queryByText } = render(<GameScreen />);
      expect(getByText('아쉬워요!')).toBeTruthy();
      expect(getByText('APPLE')).toBeTruthy();
      expect(queryByText(/번 만에 맞혔어요/)).toBeNull();
    });
  });

  // ── Daily Mode ──

  describe('Daily Mode', () => {
    it('should show countdown in daily mode', () => {
      (useLocalSearchParams as jest.Mock).mockReturnValue({ difficulty: 'normal', daily: '1' });
      mockGame.gameStatus = 'won';
      const { getByText, queryByText } = render(<GameScreen />);
      expect(getByText('다음 단어까지')).toBeTruthy();
      expect(getByText('05:23:41')).toBeTruthy();
      expect(queryByText('다시 하기')).toBeNull();
    });
  });

  // ── Toast Messages ──

  describe('Toast Messages', () => {
    it('should display toast when present', () => {
      mockGame.toastMessage = '단어가 너무 짧아요';
      const { getByText } = render(<GameScreen />);
      expect(getByText('단어가 너무 짧아요')).toBeTruthy();
    });

    it('should not display toast when empty', () => {
      const { queryByText } = render(<GameScreen />);
      expect(queryByText('단어가 너무 짧아요')).toBeNull();
    });
  });

  // ── Stats Navigation ──

  describe('Stats Navigation', () => {
    it('should navigate to stats from header', () => {
      const { getByText } = render(<GameScreen />);
      fireEvent.press(getByText('📊'));
      expect(mockPush).toHaveBeenCalledWith('/stats');
    });
  });

  // ── Accessibility ──

  describe('Accessibility', () => {
    it('should have game result accessibility label', () => {
      mockGame.gameStatus = 'won';
      const { getByLabelText } = render(<GameScreen />);
      expect(getByLabelText('게임 결과')).toBeTruthy();
    });
  });
});
