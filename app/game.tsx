import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Difficulty } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { useWordle } from '../hooks/useWordle';
import { useSound } from '../hooks/useSound';
import { useStats } from '../hooks/useStats';
import { useDailyWord } from '../hooks/useDailyWord';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import HintPanel from '../components/HintPanel';
import Keyboard from '../components/Keyboard';
import ResultModal from '../components/ResultModal';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty: Difficulty; daily: string }>();
  const difficulty = (params.difficulty ?? 'normal') as Difficulty;
  const isDaily = params.daily === '1';

  const game = useWordle(difficulty);
  const { play } = useSound();
  const { record } = useStats();
  const daily = useDailyWord(difficulty);

  const gameEndRecorded = useRef(false);

  // Start with daily word if daily mode
  useEffect(() => {
    if (isDaily && !daily.dailyCompleted) {
      game.startWithWord(daily.dailyWord);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sound effects
  useEffect(() => {
    if (game.isShaking) {
      play('shake');
    }
  }, [game.isShaking, play]);

  useEffect(() => {
    if (game.isRevealing) {
      play('flip');
    }
  }, [game.isRevealing, play]);

  // Record game result
  useEffect(() => {
    if (game.gameStatus === 'playing' || gameEndRecorded.current) return;
    gameEndRecorded.current = true;

    const won = game.gameStatus === 'won';
    play(won ? 'win' : 'lose');
    record(won, game.guesses.length);

    if (isDaily) {
      daily.markDailyComplete(won, game.guesses);
    }
  }, [game.gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewGame = () => {
    gameEndRecorded.current = false;
    game.newGame();
  };

  const handleChangeDifficulty = () => {
    router.back();
  };

  const handleStatsPress = () => {
    router.push('/stats');
  };

  const handleLetterPress = (letter: string) => {
    play('pop');
    game.addLetter(letter);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header showStats onStatsPress={handleStatsPress} />

      <View style={styles.content}>
        {game.toastMessage ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{game.toastMessage}</Text>
          </View>
        ) : null}

        <GameBoard
          guesses={game.guesses}
          evaluations={game.evaluations}
          currentGuess={game.currentGuess}
          maxAttempts={game.maxAttempts}
          wordLength={game.wordLength}
          isRevealing={game.isRevealing}
          isShaking={game.isShaking}
          gameStatus={game.gameStatus}
        />

        <HintPanel
          hints={game.hints}
          hintsUsed={game.hintsUsed}
          maxHints={3}
          gameStatus={game.gameStatus}
          onRequestHint={game.requestHint}
        />

        <View style={styles.keyboardArea}>
          <Keyboard
            keyStatuses={game.keyStatuses}
            onLetter={handleLetterPress}
            onEnter={game.submitGuess}
            onBackspace={game.removeLetter}
          />
        </View>
      </View>

      <ResultModal
        gameStatus={game.gameStatus}
        targetWord={game.targetWord}
        attempts={game.guesses.length}
        maxAttempts={game.maxAttempts}
        evaluations={game.evaluations}
        isDaily={isDaily}
        countdown={daily.countdown}
        onNewGame={handleNewGame}
        onChangeDifficulty={handleChangeDifficulty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  toast: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  toastText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  keyboardArea: {
    marginTop: 'auto',
    paddingBottom: 4,
    width: '100%',
  },
});
