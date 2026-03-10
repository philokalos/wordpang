import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';

interface FlashCardProps {
  word: WordEntry;
  onKnew: () => void;
  onForgot: () => void;
}

export default function FlashCard({ word, onKnew, onForgot }: FlashCardProps) {
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
    rotation.value = withTiming(isFlipped ? 0 : 1, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFlip} style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.front, frontStyle]}>
          <Text style={styles.wordText}>{word.word}</Text>
          <Text style={styles.tapHint}>탭하여 뒤집기</Text>
        </Animated.View>

        <Animated.View style={[styles.card, styles.back, backStyle]}>
          <Text style={styles.meaning}>{word.meaning}</Text>
          <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
          <Text style={styles.example}>"{word.example}"</Text>
        </Animated.View>
      </Pressable>

      {isFlipped && (
        <View style={styles.actions}>
          <Pressable
            onPress={onForgot}
            style={({ pressed }) => [styles.forgotButton, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.forgotText}>다시 볼게요</Text>
          </Pressable>
          <Pressable
            onPress={onKnew}
            style={({ pressed }) => [styles.knewButton, { opacity: pressed ? 0.8 : 1 }]}
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
    width: 280,
    height: 180,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  front: {
    backgroundColor: COLORS.purple,
  },
  back: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  wordText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 4,
  },
  tapHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  meaning: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pronunciation: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  example: {
    fontSize: 13,
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
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  knewButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  knewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22c55e',
  },
});
