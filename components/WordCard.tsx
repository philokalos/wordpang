import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';

interface WordCardProps {
  word: WordEntry;
}

const CATEGORY_LABELS: Record<string, string> = {
  animal: '🐾 동물',
  food: '🍎 음식',
  school: '📚 학교',
  nature: '🌿 자연',
  body: '🫀 몸',
  home: '🏠 집',
  action: '🏃 동작',
  feeling: '💭 감정',
};

export default function WordCard({ word }: WordCardProps) {
  const highlighted = word.example.replace(
    new RegExp(`(${word.word})`, 'gi'),
    '[$1]',
  );

  return (
    <View style={styles.card}>
      <Text style={styles.word}>{word.word}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[word.category] ?? word.category}</Text>
      </View>
      <Text style={styles.meaning}>{word.meaning}</Text>
      <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
      <View style={styles.exampleBox}>
        <Text style={styles.example}>"{highlighted}"</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.purpleBg,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  word: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.purpleText,
    letterSpacing: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  partOfSpeech: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.pink,
    backgroundColor: COLORS.pinkLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.purpleText,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  meaning: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  pronunciation: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  exampleBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    width: '100%',
  },
  example: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
