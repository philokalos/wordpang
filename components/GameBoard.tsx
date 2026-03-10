import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { LetterStatus, GameStatus } from '../src/types/game';
import GameRow from './GameRow';

interface GameBoardProps {
  guesses: string[];
  evaluations: LetterStatus[][];
  currentGuess: string;
  maxAttempts: number;
  wordLength: number;
  isRevealing: boolean;
  isShaking: boolean;
  gameStatus: GameStatus;
}

export default function GameBoard({
  guesses,
  evaluations,
  currentGuess,
  maxAttempts,
  wordLength,
  isRevealing,
  isShaking,
  gameStatus,
}: GameBoardProps) {
  const rows = Array.from({ length: maxAttempts }, (_, i) => {
    if (i < guesses.length) {
      const isLastGuess = i === guesses.length - 1;
      return (
        <GameRow
          key={i}
          guess={guesses[i]!}
          evaluation={evaluations[i]}
          wordLength={wordLength}
          isRevealing={isLastGuess && isRevealing}
          isWinRow={isLastGuess && gameStatus === 'won'}
        />
      );
    }

    if (i === guesses.length) {
      return (
        <GameRow
          key={i}
          guess={currentGuess}
          wordLength={wordLength}
          isCurrentRow
          isShaking={isShaking}
        />
      );
    }

    return (
      <GameRow
        key={i}
        guess=""
        wordLength={wordLength}
      />
    );
  });

  return (
    <View style={styles.board} accessibilityLabel="game board">
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    gap: 6,
  },
});
