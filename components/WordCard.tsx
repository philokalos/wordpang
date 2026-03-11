import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';

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

export default function WordCard({ word }: { word: WordEntry }) {
  const highlighted = word.example.replace(
    new RegExp(`(${word.word})`, 'gi'),
    '[$1]',
  );

  return (
    <View style={[styles.card, SKETCHY_RADIUS.large]} accessibilityLabel={`${word.word}, ${word.meaning}, ${word.partOfSpeech}`}>
      <Text style={styles.word}>{word.word}</Text>
      <View style={styles.metaRow}>
        <Text style={[styles.partOfSpeech, SKETCHY_RADIUS.small]}>{word.partOfSpeech}</Text>
        <Text style={[styles.category, SKETCHY_RADIUS.small]}>{CATEGORY_LABELS[word.category] ?? word.category}</Text>
      </View>
      <Text style={styles.meaning}>{word.meaning}</Text>
      <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
      <View style={[styles.exampleBox, SKETCHY_RADIUS.small]}>
        <Text style={styles.example}>"{highlighted}"</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.purpleBg,
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  word: {
    fontSize: 26,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purpleText,
    letterSpacing: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  partOfSpeech: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.pinkText,
    backgroundColor: COLORS.pinkLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  category: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.purpleText,
    backgroundColor: '#EDE7F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  meaning: {
    fontSize: 18,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  pronunciation: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  exampleBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
    padding: 10,
    marginTop: 8,
    width: '100%',
  },
  example: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
