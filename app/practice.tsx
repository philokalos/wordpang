import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, FONT_SIZES } from '../constants/theme';
import { useReview } from '../hooks/useReview';
import { useGame } from '../hooks/useGame';
import { useSound } from '../hooks/useSound';
import { getWordList } from '../src/data';
import type { WordEntry } from '../src/types/word';
import PaperBackground from '../components/sketchy/PaperBackground';
import DoodleDecoration from '../components/sketchy/DoodleDecoration';
import GameBoard from '../components/GameBoard';
import Keyboard from '../components/Keyboard';
import SessionSummary from '../components/SessionSummary';

interface PracticeResult {
  word: string;
  correct: boolean;
  guessCount: number;
}

export default function PracticeScreen() {
  const router = useRouter();
  const { dueWords, markReviewed } = useReview();
  const { play } = useSound();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const sessionWords = dueWords.slice(0, 5);
  const totalWords = sessionWords.length;

  const findWordEntry = (word: string): WordEntry | undefined => {
    for (const diff of ['easy', 'normal', 'hard'] as const) {
      const { answers } = getWordList(diff);
      const found = answers.find((a) => a.word === word);
      if (found) return found;
    }
    return undefined;
  };

  const currentDueWord = sessionWords[currentIndex];
  const currentWordEntry = currentDueWord ? findWordEntry(currentDueWord.word) : undefined;
  const wordLength = currentWordEntry?.word.length ?? 5;
  const difficulty = wordLength === 4 ? 'easy' as const : wordLength === 6 ? 'hard' as const : 'normal' as const;

  const game = useGame({ difficulty });
  const gameEndRef = useRef(false);

  useEffect(() => {
    if (currentWordEntry && !isComplete) {
      gameEndRef.current = false;
      game.startWithWord(currentWordEntry);
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (game.gameStatus === 'playing' || gameEndRef.current) return;
    gameEndRef.current = true;

    const won = game.gameStatus === 'won';
    play(won ? 'win' : 'lose');

    if (currentDueWord) {
      markReviewed(currentDueWord.word);
    }

    setResults((prev) => [
      ...prev,
      { word: currentWordEntry?.word ?? '', correct: won, guessCount: game.guesses.length },
    ]);

    setTimeout(() => {
      if (currentIndex + 1 >= totalWords) {
        setIsComplete(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1500);
  }, [game.gameStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (game.isShaking) play('shake');
  }, [game.isShaking, play]);

  useEffect(() => {
    if (game.isRevealing) play('flip');
  }, [game.isRevealing, play]);

  const handleLetterPress = (letter: string) => {
    play('pop');
    game.addLetter(letter);
  };

  if (totalWords === 0) {
    return (
      <PaperBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
            </Pressable>
            <Text style={styles.title}>연습</Text>
            <View style={styles.spacer} />
          </View>
          <View style={styles.emptyState}>
            <View style={styles.emptyDoodleRow}>
              <DoodleDecoration type="star" size={18} seed={40} />
              <Text style={styles.emptyEmoji}>📚</Text>
              <DoodleDecoration type="star" size={18} seed={41} />
            </View>
            <Text style={styles.emptyText}>연습할 단어가 없어요</Text>
            <Text style={styles.emptySubtext}>게임에서 단어를 학습하면 여기에 나타나요!</Text>
            <DoodleDecoration type="squiggle" size={48} seed={42} style={styles.emptySquiggle} />
          </View>
        </SafeAreaView>
      </PaperBackground>
    );
  }

  if (isComplete) {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <PaperBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <SessionSummary
            results={results}
            correctCount={correctCount}
            totalCount={totalWords}
            onClose={() => router.back()}
          />
        </SafeAreaView>
      </PaperBackground>
    );
  }

  return (
    <PaperBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
          </Pressable>
          <Text style={styles.title}>연습</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.progressDots} accessibilityLabel={`${currentIndex + 1}/${totalWords} 진행 중`}>
          {Array.from({ length: totalWords }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < currentIndex && styles.dotDone,
                i === currentIndex && styles.dotCurrent,
              ]}
            />
          ))}
        </View>

        <View style={styles.content}>
          {game.toastMessage ? (
            <View style={[styles.toast, SKETCHY_RADIUS.small]}>
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

          <View style={styles.keyboardArea}>
            <Keyboard
              keyStatuses={game.keyStatuses}
              onLetter={handleLetterPress}
              onEnter={game.submitGuess}
              onBackspace={game.removeLetter}
            />
          </View>
        </View>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.purpleText,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  spacer: {
    width: 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  toast: {
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  toastText: {
    color: COLORS.surface,
    fontFamily: SKETCHY_FONTS.bold,
    fontSize: FONT_SIZES.sm,
  },
  keyboardArea: {
    marginTop: 'auto',
    paddingBottom: 4,
    width: '100%',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
  },
  dotDone: {
    backgroundColor: COLORS.correct,
    borderColor: COLORS.correctBorder,
  },
  dotCurrent: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleDark,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyDoodleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emptySquiggle: {
    marginTop: 16,
    opacity: 0.5,
  },
});
