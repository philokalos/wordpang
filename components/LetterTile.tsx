import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import type { LetterStatus } from '../src/types/game';
import { COLORS, STATUS_COLORS } from '../constants/colors';
import { getTileSize } from '../constants/layout';
import { FLIP_DURATION, POP_DURATION, BOUNCE_DURATION, EASING } from '../constants/animations';
import { SKETCHY_FONTS } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';

interface LetterTileProps {
  letter: string;
  status?: LetterStatus;
  delay?: number;
  isRevealing?: boolean;
  isBouncing?: boolean;
  isPopping?: boolean;
  wordLength: number;
}

export default function LetterTile({
  letter,
  status,
  delay = 0,
  isRevealing = false,
  isBouncing = false,
  isPopping = false,
  wordLength,
}: LetterTileProps) {
  const flipProgress = useSharedValue(0);
  const popScale = useSharedValue(1);
  const bounceY = useSharedValue(0);

  const tileSize = getTileSize(wordLength);

  // Stable irregular borderRadius per tile based on letter+delay as seed
  const sketchyRadius = useMemo(() => {
    const seed = (letter.charCodeAt(0) || 65) * 31 + delay;
    const rand = seededRandom(seed);
    return {
      borderTopLeftRadius: 5 + Math.round(rand() * 6),
      borderTopRightRadius: 7 + Math.round(rand() * 6),
      borderBottomLeftRadius: 6 + Math.round(rand() * 6),
      borderBottomRightRadius: 4 + Math.round(rand() * 6),
    };
  }, [letter, delay]);

  useEffect(() => {
    if (isRevealing && status) {
      flipProgress.value = withDelay(
        delay,
        withTiming(1, { duration: FLIP_DURATION, easing: EASING.flip }),
      );
    } else if (status && !isRevealing) {
      flipProgress.value = 1;
    } else {
      flipProgress.value = 0;
    }
  }, [isRevealing, status, delay, flipProgress]);

  useEffect(() => {
    if (isPopping) {
      popScale.value = withSequence(
        withTiming(1.15, { duration: POP_DURATION, easing: EASING.pop }),
        withTiming(1, { duration: POP_DURATION }),
      );
    }
  }, [isPopping, popScale, letter]);

  useEffect(() => {
    if (isBouncing) {
      bounceY.value = withDelay(
        delay,
        withSequence(
          withTiming(-12, { duration: BOUNCE_DURATION * 0.4, easing: EASING.bounce }),
          withTiming(0, { duration: BOUNCE_DURATION * 0.6 }),
        ),
      );
    } else {
      bounceY.value = 0;
    }
  }, [isBouncing, delay, bounceY]);

  const animatedStyle = useAnimatedStyle(() => {
    const rotateX = interpolate(flipProgress.value, [0, 0.5, 1], [0, 90, 0]);
    const isRevealed = flipProgress.value > 0.5;

    const statusColors = status ? STATUS_COLORS[status] : undefined;

    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${rotateX}deg` },
        { scale: popScale.value },
        { translateY: bounceY.value },
      ],
      backgroundColor: isRevealed && statusColors ? statusColors.bg : COLORS.tileBg,
      borderColor: isRevealed && statusColors
        ? statusColors.border
        : (letter ? COLORS.tileActiveBorder : COLORS.tileBorder),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const isRevealed = flipProgress.value > 0.5;
    return {
      color: isRevealed && status ? '#ffffff' : COLORS.textPrimary,
    };
  });

  return (
    <Animated.View
      style={[
        styles.tile,
        sketchyRadius,
        { width: tileSize, height: tileSize },
        animatedStyle,
      ]}
      accessibilityLabel={letter ? `${letter}${status ? `, ${status}` : ''}` : 'empty'}
    >
      <Animated.Text
        style={[
          styles.letter,
          { fontSize: tileSize * 0.55 },
          textStyle,
        ]}
      >
        {letter}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  letter: {
    fontFamily: SKETCHY_FONTS.bold,
  },
});
