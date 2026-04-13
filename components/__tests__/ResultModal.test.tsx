import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ResultModal from '../ResultModal';
import type { Achievement } from '../../src/types/achievement';

// Mock Share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

const targetWord = {
  word: 'APPLE',
  meaning: '사과',
  pronunciation: '애플',
  example: 'I eat an apple every day.',
  category: 'food' as const,
  partOfSpeech: 'noun',
};

const baseProps = {
  targetWord,
  attempts: 3,
  maxAttempts: 6,
  evaluations: [
    ['absent' as const, 'present' as const, 'absent' as const, 'absent' as const, 'absent' as const],
    ['correct' as const, 'correct' as const, 'absent' as const, 'present' as const, 'absent' as const],
    ['correct' as const, 'correct' as const, 'correct' as const, 'correct' as const, 'correct' as const],
  ],
  isDaily: false,
  onNewGame: jest.fn(),
  onChangeDifficulty: jest.fn(),
  onMarkLearned: jest.fn(),
};

describe('ResultModal', () => {
  it('should not render when playing', () => {
    const { queryByText } = render(
      <ResultModal {...baseProps} gameStatus="playing" />,
    );
    expect(queryByText('정답!')).toBeNull();
    expect(queryByText('아쉬워요!')).toBeNull();
  });

  it('should mark as learned', () => {
    const { getByText } = render(<ResultModal {...baseProps} gameStatus="won" />);

    expect(getByText('선생님, 저 이 단어 이제 알아요!')).toBeTruthy();

    // Press button
    fireEvent.press(getByText('선생님, 저 이 단어 이제 알아요!'));
    expect(baseProps.onMarkLearned).toHaveBeenCalledTimes(1);

    expect(getByText('머릿속에 쏙쏙! 아주 잘했어요! 🧠')).toBeTruthy();
  });

  it('should show "정답!" when won', () => {
    const { getByLabelText, getByText } = render(<ResultModal {...baseProps} gameStatus="won" attempts={3} />);
    expect(getByLabelText('게임 결과')).toBeTruthy();
    expect(getByText('우리 친구, 정말 대단해요! 3번 만에 맞혔네요! ✨')).toBeTruthy();
  });

  it('should show "아쉬워요!" when lost', () => {
    const { getByLabelText } = render(<ResultModal {...baseProps} gameStatus="lost" attempts={6} />);
    expect(getByLabelText('게임 결과')).toBeTruthy();
  });

  it('should display word details', () => {
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="won" />,
    );
    expect(getByText('APPLE')).toBeTruthy();
    expect(getByText('사과')).toBeTruthy();
    expect(getByText('[애플]')).toBeTruthy();
    expect(getByText('"I eat an [apple] every day."')).toBeTruthy();
  });

  it('should show "배웠어요" button when onMarkLearned provided', () => {
    const onMarkLearned = jest.fn();
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="won" onMarkLearned={onMarkLearned} />,
    );
    expect(getByText('선생님, 저 이 단어 이제 알아요!')).toBeTruthy();
  });

  it('should call onMarkLearned and show "머릿속에 쏙쏙! 아주 잘했어요! 🧠" when button pressed', () => {
    const onMarkLearned = jest.fn();
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="won" onMarkLearned={onMarkLearned} />,
    );
    fireEvent.press(getByText('선생님, 저 이 단어 이제 알아요!'));
    expect(onMarkLearned).toHaveBeenCalledTimes(1);
    expect(getByText('머릿속에 쏙쏙! 아주 잘했어요! 🧠')).toBeTruthy();
  });

  it('should show achievement badges when newAchievements provided', () => {
    const achievements: Achievement[] = [
      { id: 'first_win', title: '첫 승리!', description: '처음으로 단어를 맞혔어요', icon: '🏆' },
      { id: 'streak_3', title: '3일 연속!', description: '3일 연속 게임에 성공했어요', icon: '🔥' },
    ];
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="won" newAchievements={achievements} />,
    );
    expect(getByText('첫 승리!')).toBeTruthy();
    expect(getByText('3일 연속!')).toBeTruthy();
  });

  it('should show countdown in daily mode', () => {
    const { getByText, queryByText } = render(
      <ResultModal
        {...baseProps}
        gameStatus="won"
        isDaily={true}
        countdown="05:23:41"
      />,
    );
    expect(getByText('조금만 기다리면 다음 단어가 나와요')).toBeTruthy();
    expect(getByText('05:23:41')).toBeTruthy();
    expect(queryByText('한 번 더 해볼까요?')).toBeNull();
  });
});
