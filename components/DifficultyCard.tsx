import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import type { Difficulty } from '../src/types/game';
import { DIFFICULTY_CONFIG } from '../src/types/game';
import { COLORS } from '../constants/colors';

interface DifficultyCardProps {
  difficulty: Difficulty;
  isSelected: boolean;
  onPress: () => void;
}

export default function DifficultyCard({ difficulty, isSelected, onPress }: DifficultyCardProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} 난이도, ${config.wordLength}글자`}
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : (isSelected ? 1.03 : 1) }] },
      ]}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{config.label}</Text>
      <Text style={[styles.detail, isSelected && styles.detailSelected]}>
        {config.wordLength}글자
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e9d5ff',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 90,
  },
  cardSelected: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.purpleText,
  },
  labelSelected: {
    color: COLORS.surface,
  },
  detail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  detailSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
});
