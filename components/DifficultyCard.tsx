import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Difficulty } from '../src/types/game';
import { DIFFICULTY_CONFIG } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS } from '../constants/theme';
import { useSketchyStyle } from '../hooks/useSketchyStyle';
import { WOBBLE_ROTATION, WOBBLE_DURATION, EASING } from '../constants/animations';

interface DifficultyCardProps {
  difficulty: Difficulty;
  isSelected: boolean;
  onPress: () => void;
}

const SEED_MAP: Record<Difficulty, number> = { easy: 10, normal: 20, hard: 30 };

export default function DifficultyCard({ difficulty, isSelected, onPress }: DifficultyCardProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const sketchyStyle = useSketchyStyle({ seed: SEED_MAP[difficulty], radiusSize: 'large', rotation: true, maxRotation: 1.2 });

  const wobbleRotation = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      wobbleRotation.value = withRepeat(
        withSequence(
          withTiming(WOBBLE_ROTATION * 0.8, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
          withTiming(-WOBBLE_ROTATION * 0.8, { duration: WOBBLE_DURATION / 2, easing: EASING.wobble }),
          withTiming(0, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
        ),
        -1,
      );
    } else {
      wobbleRotation.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected, wobbleRotation]);

  const wobbleAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${wobbleRotation.value}deg` },
      { scale: isSelected ? 1.03 : 1 },
    ],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, wobbleAnimStyle]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${config.label} 난이도, ${config.wordLength}글자`}
        accessibilityState={{ selected: isSelected }}
        style={({ pressed }) => [
          styles.card,
          sketchyStyle,
          isSelected && styles.cardSelected,
          {
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.label, isSelected && styles.labelSelected]}>{config.label}</Text>
        <Text style={[styles.detail, isSelected && styles.detailSelected]}>
          {config.wordLength}글자
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 80,
  },
  cardSelected: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleDark,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purpleText,
  },
  labelSelected: {
    color: COLORS.surface,
  },
  detail: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  detailSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
});
