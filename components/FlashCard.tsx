import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  PanResponder,
  Animated,
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, FONT_SIZES } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';

interface FlashCardProps {
  word: WordEntry;
  onKnew: () => void;
  onForgot: () => void;
  onFlip?: () => void;
}

const SWIPE_THRESHOLD = 80;

export default function FlashCard({ word, onKnew, onForgot, onFlip }: FlashCardProps) {
  const { isTablet, screenWidth } = useResponsive();
  const [isFlipped, setIsFlipped] = useState(false);
  const cardWidth = isTablet ? Math.min(400, screenWidth - 100) : Math.min(280, screenWidth - 64);
  const cardHeight = isTablet ? 260 : 180;

  // Reanimated for flip
  const rotation = useSharedValue(0);

  // RN Animated for swipe pan gesture
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeOverlayOpacity = useRef(new Animated.Value(0)).current;

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

  const animateOut = (direction: 'left' | 'right', callback: () => void) => {
    const toValue = direction === 'right' ? cardWidth + 60 : -(cardWidth + 60);
    Animated.parallel([
      Animated.timing(translateX, { toValue, duration: 220, useNativeDriver: true }),
      Animated.timing(swipeOverlayOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      translateX.setValue(0);
      swipeOverlayOpacity.setValue(0);
      callback();
    });
  };

  const snapBack = () => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 8 }),
      Animated.timing(swipeOverlayOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 12 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
        const progress = Math.min(Math.abs(gs.dx) / SWIPE_THRESHOLD, 1);
        swipeOverlayOpacity.setValue(progress * 0.35);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > SWIPE_THRESHOLD) {
          animateOut('right', onKnew);
        } else if (gs.dx < -SWIPE_THRESHOLD) {
          animateOut('left', onForgot);
        } else {
          snapBack();
        }
      },
      onPanResponderTerminate: () => {
        snapBack();
      },
    })
  ).current;

  const leftLabelOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20, 0],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const rightLabelOpacity = translateX.interpolate({
    inputRange: [0, 20, SWIPE_THRESHOLD],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  const overlayBg = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [COLORS.pink, 'transparent', COLORS.correct],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          { width: cardWidth, height: cardHeight },
          { transform: [{ translateX }] },
        ]}
      >
        <Pressable
          onPress={handleFlip}
          accessibilityRole="button"
          accessibilityLabel="플래시카드, 탭하여 뒤집기"
          accessibilityHint="카드를 뒤집어 뜻을 확인합니다"
          style={{ width: cardWidth, height: cardHeight }}
        >
          <ReAnimated.View style={[styles.card, styles.front, SKETCHY_RADIUS.large, frontStyle]}>
            <Text style={[styles.wordText, { fontSize: isTablet ? 44 : 34 }]}>{word.word}</Text>
            <Text style={styles.tapHint}>탭하여 뒤집기 · 스와이프로 평가</Text>
          </ReAnimated.View>

          <ReAnimated.View style={[styles.card, styles.back, SKETCHY_RADIUS.large, backStyle]}>
            <Text style={[styles.meaning, { fontSize: isTablet ? 30 : 24 }]}>{word.meaning}</Text>
            <Text style={styles.pronunciation}>[{word.pronunciation}]</Text>
            <Text style={styles.example}>"{word.example}"</Text>
          </ReAnimated.View>
        </Pressable>

        {/* 스와이프 방향 오버레이 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.swipeOverlay,
            SKETCHY_RADIUS.large,
            { opacity: swipeOverlayOpacity, backgroundColor: overlayBg },
          ]}
        />

        {/* 스와이프 힌트 레이블 */}
        <Animated.View
          pointerEvents="none"
          style={[styles.swipeLabel, styles.swipeLabelLeft, { opacity: leftLabelOpacity }]}
        >
          <Text style={styles.swipeLabelText}>다시 볼게요 👈</Text>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.swipeLabel, styles.swipeLabelRight, { opacity: rightLabelOpacity }]}
        >
          <Text style={styles.swipeLabelText}>👉 알고 있어요</Text>
        </Animated.View>
      </Animated.View>

      {isFlipped && (
        <View style={styles.actions}>
          <Pressable
            onPress={onForgot}
            accessibilityRole="button"
            accessibilityLabel="다시 볼게요"
            style={({ pressed }) => [styles.forgotButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.forgotText}>← 다시 볼게요</Text>
          </Pressable>
          <Pressable
            onPress={onKnew}
            accessibilityRole="button"
            accessibilityLabel="알고 있어요"
            style={({ pressed }) => [styles.knewButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.knewText}>알고 있어요! →</Text>
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
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  swipeLabel: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  swipeLabelLeft: {
    left: 8,
    backgroundColor: COLORS.pinkLight,
  },
  swipeLabelRight: {
    right: 8,
    backgroundColor: '#E8F5E9',
  },
  swipeLabelText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  wordText: {
    fontSize: 34,
    fontFamily: SKETCHY_FONTS.bold,
    color: '#ffffff',
    letterSpacing: 4,
  },
  tapHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  meaning: {
    fontSize: 24,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  pronunciation: {
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  example: {
    fontSize: FONT_SIZES.xs,
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
    fontSize: FONT_SIZES.sm,
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
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.correctBorder,
  },
});
