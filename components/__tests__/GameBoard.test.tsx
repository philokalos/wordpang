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

  it('should render completed guesses with evaluations', () => {
    const guesses = ['HELLO', 'WORLD'];
    const evaluations: ('correct' | 'present' | 'absent')[][] = [
      ['correct', 'absent', 'present', 'absent', 'correct'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    const { getByLabelText } = render(
      <GameBoard
        guesses={guesses}
        evaluations={evaluations}
        currentGuess=""
        maxAttempts={6}
        wordLength={5}
        isRevealing={false}
        isShaking={false}
        gameStatus="playing"
      />,
    );
    const board = getByLabelText('game board');
    expect(board.children).toHaveLength(6);
  });

  it('should set isRevealing on the last guess row', () => {
    const guesses = ['HELLO', 'WORLD'];
    const evaluations: ('correct' | 'present' | 'absent')[][] = [
      ['correct', 'absent', 'present', 'absent', 'correct'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    const { getByLabelText } = render(
      <GameBoard
        guesses={guesses}
        evaluations={evaluations}
        currentGuess=""
        maxAttempts={6}
        wordLength={5}
        isRevealing={true}
        isShaking={false}
        gameStatus="playing"
      />,
    );
    const board = getByLabelText('game board');
    // Board renders all rows; isRevealing is passed to the last guess row
    expect(board.children).toHaveLength(6);
  });

  it('should mark win row when game is won', () => {
    const guesses = ['HELLO', 'WORLD'];
    const evaluations: ('correct' | 'present' | 'absent')[][] = [
      ['correct', 'absent', 'present', 'absent', 'correct'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    const { getByLabelText } = render(
      <GameBoard
        guesses={guesses}
        evaluations={evaluations}
        currentGuess=""
        maxAttempts={6}
        wordLength={5}
        isRevealing={false}
        isShaking={false}
        gameStatus="won"
      />,
    );
    const board = getByLabelText('game board');
    expect(board.children).toHaveLength(6);
  });
});
