import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, FONT_SIZES } from '../constants/theme';

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

  const handleSpeak = () => {
    Speech.speak(word.word, { language: 'en-US', rate: 0.8 });
  };

  return (
    <View style={[styles.card, SKETCHY_RADIUS.large]} accessibilityLabel={`${word.word}, ${word.meaning}, ${word.partOfSpeech}`}>
      <View style={styles.wordRow}>
        <Text style={styles.word}>{word.word}</Text>
        <Pressable
          onPress={handleSpeak}
          style={({ pressed }) => [styles.speakButton, SKETCHY_RADIUS.small, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="발음 듣기"
        >
          <Text style={styles.speakIcon}>🔊</Text>
        </Pressable>
      </View>
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
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  word: {
    fontSize: 26,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purpleText,
    letterSpacing: 3,
  },
  speakButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speakIcon: {
    fontSize: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  partOfSpeech: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.pinkText,
    backgroundColor: COLORS.pinkLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  category: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.purpleText,
    backgroundColor: COLORS.categoryChipBg,
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
    fontSize: FONT_SIZES.sm,
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
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
