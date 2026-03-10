import React from 'react';
import { render } from '@testing-library/react-native';
import ResultModal from '../ResultModal';

// Mock Share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

const targetWord = {
  word: 'APPLE',
  meaning: '사과',
  pronunciation: '애플',
  example: 'I eat an apple every day.',
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
};

describe('ResultModal', () => {
  it('should not render when playing', () => {
    const { queryByText } = render(
      <ResultModal {...baseProps} gameStatus="playing" />,
    );
    expect(queryByText('정답!')).toBeNull();
    expect(queryByText('아쉬워요!')).toBeNull();
  });

  it('should show "정답!" when won', () => {
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="won" />,
    );
    expect(getByText('정답!')).toBeTruthy();
    expect(getByText('3/6 번 만에 맞혔어요!')).toBeTruthy();
  });

  it('should show "아쉬워요!" when lost', () => {
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="lost" />,
    );
    expect(getByText('아쉬워요!')).toBeTruthy();
  });

  it('should display word details', () => {
    const { getByText } = render(
      <ResultModal {...baseProps} gameStatus="won" />,
    );
    expect(getByText('APPLE')).toBeTruthy();
    expect(getByText('사과')).toBeTruthy();
    expect(getByText('[애플]')).toBeTruthy();
    expect(getByText('"I eat an apple every day."')).toBeTruthy();
  });
});
