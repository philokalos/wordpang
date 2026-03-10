import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import type { LetterStatus } from '../src/types/game';
import { shareResult } from '../services/share';
import { COLORS } from '../constants/colors';

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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.correct,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
