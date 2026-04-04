/**
 * Component-level E2E Tests
 *
 * Tests for individual components in isolation:
 * - WordCard: word details display, accessibility
 * - FlashCard: flip, action buttons, callbacks
 * - SessionSummary: score, emoji thresholds, result list
 * - ReviewList: empty state, word list, status badges
 * - Header: title, subtitle, stats button
 * - DifficultyPrompt: up/down recommendations, callbacks
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// ── Mocks ──

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
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

// ── WordCard ──

import WordCard from '../../components/WordCard';

describe('WordCard E2E', () => {
  const word = {
    word: 'TIGER', meaning: '호랑이', pronunciation: '타이거',
    example: 'The tiger is strong.', category: 'animal' as const, partOfSpeech: 'noun',
  };

  it('should display word, meaning, pronunciation, and part of speech', () => {
    const { getByText } = render(<WordCard word={word} />);
    expect(getByText('TIGER')).toBeTruthy();
    expect(getByText('호랑이')).toBeTruthy();
    expect(getByText('[타이거]')).toBeTruthy();
    expect(getByText('noun')).toBeTruthy();
  });

  it('should display category label', () => {
    const { getByText } = render(<WordCard word={word} />);
    expect(getByText('🐾 동물')).toBeTruthy();
  });

  it('should highlight word in example sentence', () => {
    const { getByText } = render(<WordCard word={word} />);
    expect(getByText(/"The \[tiger\] is strong\."/i)).toBeTruthy();
  });

  it('should have accessibility label', () => {
    const { getByLabelText } = render(<WordCard word={word} />);
    expect(getByLabelText('TIGER, 호랑이, noun')).toBeTruthy();
  });
});

// ── FlashCard ──

import FlashCard from '../../components/FlashCard';

describe('FlashCard E2E', () => {
  const word = {
    word: 'BREAD', meaning: '빵', pronunciation: '브레드',
    example: 'I like bread.', category: 'food' as const, partOfSpeech: 'noun',
  };
  const onKnew = jest.fn();
  const onForgot = jest.fn();
  const onFlip = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('should display word and tap hint on front', () => {
    const { getByText } = render(<FlashCard word={word} onKnew={onKnew} onForgot={onForgot} />);
    expect(getByText('BREAD')).toBeTruthy();
    expect(getByText('탭하여 뒤집기 · 스와이프로 평가')).toBeTruthy();
  });

  it('should call onFlip and show action buttons after tap', () => {
    const { getByLabelText } = render(<FlashCard word={word} onKnew={onKnew} onForgot={onForgot} onFlip={onFlip} />);
    fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(getByLabelText('알고 있어요')).toBeTruthy();
    expect(getByLabelText('다시 볼게요')).toBeTruthy();
  });

  it('should not show action buttons before flip', () => {
    const { queryByLabelText } = render(<FlashCard word={word} onKnew={onKnew} onForgot={onForgot} />);
    expect(queryByLabelText('알고 있어요')).toBeNull();
  });

  it('should call onKnew when pressed', () => {
    const { getByLabelText } = render(<FlashCard word={word} onKnew={onKnew} onForgot={onForgot} onFlip={onFlip} />);
    fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
    fireEvent.press(getByLabelText('알고 있어요'));
    expect(onKnew).toHaveBeenCalledTimes(1);
  });

  it('should call onForgot when pressed', () => {
    const { getByLabelText } = render(<FlashCard word={word} onKnew={onKnew} onForgot={onForgot} onFlip={onFlip} />);
    fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
    fireEvent.press(getByLabelText('다시 볼게요'));
    expect(onForgot).toHaveBeenCalledTimes(1);
  });

  it('should display meaning on back after flip', () => {
    const { getByText, getByLabelText } = render(<FlashCard word={word} onKnew={onKnew} onForgot={onForgot} onFlip={onFlip} />);
    fireEvent.press(getByLabelText('플래시카드, 탭하여 뒤집기'));
    expect(getByText('빵')).toBeTruthy();
    expect(getByText('[브레드]')).toBeTruthy();
  });
});

// ── SessionSummary ──

import SessionSummary from '../../components/SessionSummary';

describe('SessionSummary E2E', () => {
  const onClose = jest.fn();
  beforeEach(() => jest.clearAllMocks());

  it('should display title and close button', () => {
    const { getByText } = render(<SessionSummary results={[]} correctCount={0} totalCount={0} onClose={onClose} />);
    expect(getByText('참 잘했어요! 오늘의 연습 끝! 💯')).toBeTruthy();
    fireEvent.press(getByText('돌아가기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should display score with percentage', () => {
    const results = [
      { word: 'APPLE', correct: true, guessCount: 2 },
      { word: 'BREAD', correct: true, guessCount: 3 },
      { word: 'CHAIR', correct: false, guessCount: 6 },
    ];
    const { getByText } = render(<SessionSummary results={results} correctCount={2} totalCount={3} onClose={onClose} />);
    expect(getByText('2/3 (67%)')).toBeTruthy();
  });

  it('should show 🎉 for >= 80%', () => {
    const { getByText } = render(
      <SessionSummary results={[{ word: 'A', correct: true, guessCount: 1 }]} correctCount={4} totalCount={5} onClose={onClose} />,
    );
    expect(getByText('🎉')).toBeTruthy();
  });

  it('should show 👍 for >= 50%', () => {
    const { getByText } = render(
      <SessionSummary results={[{ word: 'A', correct: true, guessCount: 1 }]} correctCount={1} totalCount={2} onClose={onClose} />,
    );
    expect(getByText('👍')).toBeTruthy();
  });

  it('should show 💪 for < 50%', () => {
    const { getByText } = render(
      <SessionSummary results={[{ word: 'A', correct: false, guessCount: 6 }]} correctCount={1} totalCount={3} onClose={onClose} />,
    );
    expect(getByText('💪')).toBeTruthy();
  });

  it('should display individual results', () => {
    const results = [
      { word: 'APPLE', correct: true, guessCount: 2 },
      { word: 'BREAD', correct: false, guessCount: 6 },
    ];
    const { getByText } = render(<SessionSummary results={results} correctCount={1} totalCount={2} onClose={onClose} />);
    expect(getByText('APPLE')).toBeTruthy();
    expect(getByText('BREAD')).toBeTruthy();
    expect(getByText('✅')).toBeTruthy();
    expect(getByText('❌')).toBeTruthy();
    expect(getByText('2번')).toBeTruthy();
    expect(getByText('6번')).toBeTruthy();
  });
});

// ── ReviewList ──

import ReviewList from '../../components/ReviewList';

describe('ReviewList E2E', () => {
  it('should show empty state when no entries', () => {
    const { getByText } = render(<ReviewList entries={[]} />);
    expect(getByText('아직 학습한 단어가 없어요')).toBeTruthy();
  });

  it('should display words with status badges', () => {
    const entries = [
      { word: 'APPLE', lastReviewed: 1704067200000, reviewCount: 3, nextReview: 1704153600000, status: 'mastered' as const },
      { word: 'BREAD', lastReviewed: 1704067200000, reviewCount: 1, nextReview: 1704067200000, status: 'learning' as const },
      { word: 'CHAIR', lastReviewed: 1704067200000, reviewCount: 0, nextReview: 1704067200000, status: 'new' as const },
    ];
    const { getByText } = render(<ReviewList entries={entries} />);
    expect(getByText('APPLE')).toBeTruthy();
    expect(getByText('마스터')).toBeTruthy();
    expect(getByText('BREAD')).toBeTruthy();
    expect(getByText('학습 중')).toBeTruthy();
    expect(getByText('CHAIR')).toBeTruthy();
    expect(getByText('새 단어')).toBeTruthy();
  });
});

// ── Header ──

import Header from '../../components/Header';

describe('Header E2E', () => {
  it('should display title and subtitle', () => {
    const { getByText, getByLabelText } = render(<Header />);
    expect(getByLabelText('WordPang')).toBeTruthy();
    expect(getByText('영어 단어 팡!')).toBeTruthy();
  });

  it('should show stats button when enabled', () => {
    const onStatsPress = jest.fn();
    const { getByText } = render(<Header showStats onStatsPress={onStatsPress} />);
    expect(getByText('📊')).toBeTruthy();
    fireEvent.press(getByText('📊'));
    expect(onStatsPress).toHaveBeenCalledTimes(1);
  });

  it('should not show stats button by default', () => {
    const { queryByText } = render(<Header />);
    expect(queryByText('📊')).toBeNull();
  });
});

// ── DifficultyPrompt ──

import DifficultyPrompt from '../../components/DifficultyPrompt';

describe('DifficultyPrompt E2E', () => {
  const onAccept = jest.fn();
  const onDismiss = jest.fn();
  beforeEach(() => jest.clearAllMocks());

  it('should not render when recommendation is null', () => {
    const { toJSON } = render(<DifficultyPrompt visible={true} recommendation={null} onAccept={onAccept} onDismiss={onDismiss} />);
    expect(toJSON()).toBeNull();
  });

  it('should show up recommendation', () => {
    const { getByText } = render(<DifficultyPrompt visible={true} recommendation="up" onAccept={onAccept} onDismiss={onDismiss} />);
    expect(getByText('우리, 한 단계 더 도전해 볼까요?')).toBeTruthy();
    expect(getByText('네! 더 어려운 거 해볼래요!')).toBeTruthy();
  });

  it('should show down recommendation', () => {
    const { getByText } = render(<DifficultyPrompt visible={true} recommendation="down" onAccept={onAccept} onDismiss={onDismiss} />);
    expect(getByText('선생님이 조금 더 쉬운 문제를 내줄까요?')).toBeTruthy();
    expect(getByText('네! 조금 쉬운 걸로 할래요!')).toBeTruthy();
  });

  it('should call onAccept and onDismiss', () => {
    const { getByText, getByLabelText } = render(<DifficultyPrompt visible={true} recommendation="up" onAccept={onAccept} onDismiss={onDismiss} />);
    fireEvent.press(getByText('네! 더 어려운 거 해볼래요!'));
    expect(onAccept).toHaveBeenCalledTimes(1);
    fireEvent.press(getByLabelText('아니요, 지금 이대로가 딱 좋아요!'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
