import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { COLORS } from '../constants/colors';

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
          <View key={i} style={styles.resultRow}>
            <Text style={styles.resultIcon}>{r.correct ? '✅' : '❌'}</Text>
            <Text style={styles.resultWord}>{r.word}</Text>
            <Text style={styles.resultGuesses}>{r.guessCount}번</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.buttonText}>돌아가기</Text>
      </Pressable>
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
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
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  resultIcon: {
    fontSize: 16,
  },
  resultWord: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  resultGuesses: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
