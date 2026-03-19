import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';

interface FlashCardProps {
  word: WordEntry;
  onKnew: () => void;
  onForgot: () => void;
  onFlip?: () => void;
}

export default function FlashCard({ word, onKnew, onForgot, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const handleFlip = () => {
    onFlip?.();
    rotation.value = withTiming(isFlipped ? 0 : 1, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleFlip}
        accessibilityRole="button"
        accessibilityLabel="플래시카드, 탭하여 뒤집기"
        accessibilityHint="카드를 뒤집어 뜻을 확인합니다"
        style={styles.cardContainer}
      >
        <Animated.View style={[styles.card, styles.front, SKETCHY_RADIUS.large, frontStyle]}>
          <Text style={styles.wordText}>{word.word}</Text>
          <Text style={styles.tapHint}>탭하여 뒤집기</Text>
        </Animated.View>

        <Animated.View style={[styles.card, styles.back, SKETCHY_RADIUS.large, backStyle]}>
          <Text style={styles.meaning}>{word.meaning}</Text>
          <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
          <Text style={styles.example}>"{word.example}"</Text>
        </Animated.View>
      </Pressable>

      {isFlipped && (
        <View style={styles.actions}>
          <Pressable
            onPress={onForgot}
            accessibilityRole="button"
            accessibilityLabel="다시 볼게요"
            style={({ pressed }) => [styles.forgotButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.forgotText}>다시 볼게요</Text>
          </Pressable>
          <Pressable
            onPress={onKnew}
            accessibilityRole="button"
            accessibilityLabel="알고 있어요"
            style={({ pressed }) => [styles.knewButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.knewText}>알고 있어요!</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  cardContainer: {
    width: Math.min(280, Dimensions.get('window').width - 64),
    height: 180,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
  },
  front: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleDark,
  },
  back: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.tileBorder,
  },
  wordText: {
    fontSize: 34,
    fontFamily: SKETCHY_FONTS.bold,
    color: '#ffffff',
    letterSpacing: 4,
  },
  tapHint: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  meaning: {
    fontSize: 24,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  pronunciation: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  example: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  forgotButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: COLORS.pink,
  },
  forgotText: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.pinkText,
  },
  knewButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: COLORS.correct,
  },
  knewText: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.correctBorder,
  },
});
