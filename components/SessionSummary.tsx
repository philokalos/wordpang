import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import SketchyButton from './sketchy/SketchyButton';

interface PracticeResult {
  word: string;
  correct: boolean;
  guessCount: number;
}

interface SessionSummaryProps {
  results: PracticeResult[];
  correctCount: number;
  totalCount: number;
  onClose: () => void;
}

export default function SessionSummary({
  results,
  correctCount,
  totalCount,
  onClose,
}: SessionSummaryProps) {
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '💪'}</Text>
      <Text style={styles.title}>연습 완료!</Text>
      <Text style={styles.score}>{correctCount}/{totalCount} ({percentage}%)</Text>

      <View style={styles.results}>
        {results.map((r, i) => (
          <View key={i} style={[styles.resultRow, SKETCHY_RADIUS.small]}>
            <Text style={styles.resultIcon}>{r.correct ? '✅' : '❌'}</Text>
            <Text style={styles.resultWord}>{r.word}</Text>
            <Text style={styles.resultGuesses}>{r.guessCount}번</Text>
          </View>
        ))}
      </View>

      <SketchyButton
        label="돌아가기"
        onPress={onClose}
        seed={401}
        variant="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  score: {
    fontSize: 20,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purpleText,
    marginTop: 4,
  },
  results: {
    width: '100%',
    maxWidth: 300,
    gap: 8,
    marginVertical: 24,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    padding: 12,
    gap: 10,
  },
  resultIcon: {
    fontSize: 16,
  },
  resultWord: {
    flex: 1,
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  resultGuesses: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
  },
});
