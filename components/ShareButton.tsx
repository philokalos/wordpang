import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import type { LetterStatus } from '../src/types/game';
import { shareResult } from '../services/share';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';

interface ShareButtonProps {
  won: boolean;
  attempts: number;
  maxAttempts: number;
  evaluations: LetterStatus[][];
  isDaily: boolean;
}

export default function ShareButton({
  won,
  attempts,
  maxAttempts,
  evaluations,
  isDaily,
}: ShareButtonProps) {
  const handleShare = () => {
    shareResult(won, attempts, maxAttempts, evaluations, isDaily);
  };

  return (
    <Pressable
      onPress={handleShare}
      style={({ pressed }) => [
        styles.button,
        SKETCHY_RADIUS.medium,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Text style={styles.text}>📤 결과 공유</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.correct,
    borderWidth: 2,
    borderColor: COLORS.correctBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
  },
});
