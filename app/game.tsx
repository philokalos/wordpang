import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Difficulty, HintType } from '../src/types/game';
import type { WordCategory } from '../src/types/word';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';
import { useWordle } from '../hooks/useWordle';
import { useSound } from '../hooks/useSound';
import { useStats } from '../hooks/useStats';
import { useDailyWord } from '../hooks/useDailyWord';
import { useLearnedWords } from '../hooks/useLearnedWords';
import { useAchievements } from '../hooks/useAchievements';
import { useReview } from '../hooks/useReview';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import HintPanel from '../components/HintPanel';
import Keyboard from '../components/Keyboard';
import ResultModal from '../components/ResultModal';
import DifficultyPrompt from '../components/DifficultyPrompt';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty: Difficulty; daily: string; category: string }>();
  const difficulty = (params.difficulty ?? 'normal') as Difficulty;
  const isDaily = params.daily === '1';
  const category = params.category as WordCategory | undefined;

  const game = useWordle({ difficulty, category });
  const { play } = useSound();
  const { record, getDifficultyRecommendation } = useStats();
  const daily = useDailyWord(difficulty);
  const { markLearned, learnedCount } = useLearnedWords();
  const achievements = useAchievements();
  const review = useReview();

  const gameEndRecorded = useRef(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showDifficultyPrompt, setShowDifficultyPrompt] = useState(false);

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

  // Track category
  useEffect(() => {
    if (category) {
      achievements.trackCategory(category);
    }
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Record game result
  useEffect(() => {
    if (game.gameStatus === 'playing' || gameEndRecorded.current) return;
    gameEndRecorded.current = true;

    const won = game.gameStatus === 'won';
    play(won ? 'win' : 'lose');

    (async () => {
      const stats = await record(won, game.guesses.length, difficulty);

      if (isDaily) {
        daily.markDailyComplete(won, game.guesses);
      }

      // Check achievements
      const unlocked = await achievements.check({
        stats,
        learnedCount,
        reviewCount: review.totalCount,
        lastGameWon: won,
        lastGuessCount: game.guesses.length,
        lastHintsUsed: game.hintsUsed,
        lastDifficulty: difficulty,
        isDaily,
      });
      if (unlocked.length > 0) {
        setNewAchievements(unlocked);
      }

      // Check difficulty recommendation after game
      const rec = getDifficultyRecommendation(difficulty);
      if (rec) {
        setTimeout(() => setShowDifficultyPrompt(true), 500);
      }
    })();
  }, [game.gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewGame = () => {
    gameEndRecorded.current = false;
    setNewAchievements([]);
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

  const handleRequestHint = (type: HintType) => {
    play('pop');
    game.requestHint(type);
  };

  const handleMarkLearned = async () => {
    play('pop');
    await markLearned(game.targetWord.word);
    await review.addWord(game.targetWord.word);
  };

  const handleDifficultyAccept = () => {
    setShowDifficultyPrompt(false);
    const rec = getDifficultyRecommendation(difficulty);
    if (rec === 'up') {
      const next = difficulty === 'easy' ? 'normal' : 'hard';
      router.replace({ pathname: '/game', params: { difficulty: next, daily: '0' } });
    } else if (rec === 'down') {
      const next = difficulty === 'hard' ? 'normal' : 'easy';
      router.replace({ pathname: '/game', params: { difficulty: next, daily: '0' } });
    }
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
          hintPointsUsed={game.hintPointsUsed}
          gameStatus={game.gameStatus}
          onRequestHint={handleRequestHint}
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
        newAchievements={newAchievements.length > 0 ? newAchievements : undefined}
        onNewGame={handleNewGame}
        onChangeDifficulty={handleChangeDifficulty}
        onMarkLearned={handleMarkLearned}
      />

      <DifficultyPrompt
        visible={showDifficultyPrompt && game.gameStatus !== 'playing'}
        recommendation={getDifficultyRecommendation(difficulty)}
        onAccept={handleDifficultyAccept}
        onDismiss={() => setShowDifficultyPrompt(false)}
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
