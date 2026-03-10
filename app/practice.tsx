import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useReview } from '../hooks/useReview';
import { useWordle } from '../hooks/useWordle';
import { useSound } from '../hooks/useSound';
import { getWordList } from '../src/data';
import type { WordEntry } from '../src/types/word';
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

  const game = useWordle({ difficulty });
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
          </Pressable>
          <Text style={styles.title}>연습</Text>
          <View style={styles.spacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyText}>연습할 단어가 없어요</Text>
          <Text style={styles.emptySubtext}>게임에서 단어를 학습하면 여기에 나타나요!</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SessionSummary
          results={results}
          correctCount={correctCount}
          totalCount={totalWords}
          onClose={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>
          연습 {currentIndex + 1}/{totalWords}
        </Text>
        <View style={styles.spacer} />
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.purpleText,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
