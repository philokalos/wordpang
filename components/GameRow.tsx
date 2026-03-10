import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { LetterStatus } from '../src/types/game';
import { TILE_GAP } from '../constants/layout';
import { SHAKE_DURATION, EASING, FLIP_STAGGER } from '../constants/animations';
import LetterTile from './LetterTile';

interface GameRowProps {
  guess: string;
  evaluation?: LetterStatus[];
  wordLength: number;
  isCurrentRow?: boolean;
  isRevealing?: boolean;
  isShaking?: boolean;
  isWinRow?: boolean;
}

export default function GameRow({
  guess,
  evaluation,
  wordLength,
  isCurrentRow = false,
  isRevealing = false,
  isShaking = false,
  isWinRow = false,
}: GameRowProps) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (isShaking) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(8, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(-8, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(8, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(-4, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(4, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(-2, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
        withTiming(0, { duration: SHAKE_DURATION / 8, easing: EASING.shake }),
      );
    }
  }, [isShaking, shakeX]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const tiles = Array.from({ length: wordLength }, (_, i) => {
    const letter = guess[i] ?? '';
    const status = evaluation?.[i];
    const isPopping = isCurrentRow && letter !== '' && !evaluation;

    return (
      <LetterTile
        key={i}
        letter={letter}
        status={status}
        delay={i * FLIP_STAGGER}
        isRevealing={isRevealing}
        isBouncing={isWinRow}
        isPopping={isPopping}
        wordLength={wordLength}
      />
    );
  });

  return (
    <Animated.View style={[styles.row, rowStyle]}>
      {tiles}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: TILE_GAP,
  },
});
