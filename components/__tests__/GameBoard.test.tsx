import React from 'react';
import { render } from '@testing-library/react-native';
import GameBoard from '../GameBoard';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('GameBoard', () => {
  it('should render correct number of rows based on maxAttempts', () => {
    const { getByLabelText } = render(
      <GameBoard
        guesses={[]}
        evaluations={[]}
        currentGuess=""
        maxAttempts={6}
        wordLength={5}
        isRevealing={false}
        isShaking={false}
        gameStatus="playing"
      />,
    );

    expect(getByLabelText('game board')).toBeTruthy();
    // The board should contain children for each row
    const board = getByLabelText('game board');
    expect(board.children).toHaveLength(6);
  });
});
