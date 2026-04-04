import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { WOBBLE_ROTATION, WOBBLE_DURATION, EASING } from '../constants/animations';
import DoodleDecoration from './sketchy/DoodleDecoration';
import HeroText from './sketchy/HeroText';

interface HeaderProps {
  showStats?: boolean;
  onStatsPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function Header({ showStats, onStatsPress, showBack, onBackPress }: HeaderProps) {
  const { isTablet } = useResponsive();
  const wobbleLeft = useSharedValue(0);
  const wobbleRight = useSharedValue(0);

  useEffect(() => {
    wobbleLeft.value = withRepeat(
      withSequence(
        withTiming(WOBBLE_ROTATION * 2, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
        withTiming(-WOBBLE_ROTATION * 2, { duration: WOBBLE_DURATION / 2, easing: EASING.wobble }),
        withTiming(0, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
      ),
      -1,
    );
    // Offset the right star by starting opposite
    wobbleRight.value = withRepeat(
      withSequence(
        withTiming(-WOBBLE_ROTATION * 2, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
        withTiming(WOBBLE_ROTATION * 2, { duration: WOBBLE_DURATION / 2, easing: EASING.wobble }),
        withTiming(0, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
      ),
      -1,
    );
  }, [wobbleLeft, wobbleRight]);

  const leftAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobbleLeft.value}deg` }],
  }));

  const rightAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobbleRight.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {showBack && onBackPress ? (
          <Pressable onPress={onBackPress} style={styles.backButton} accessibilityRole="button" accessibilityLabel="뒤로가기">
            <Text style={[styles.backText, { fontSize: isTablet ? 28 : 24 }]}>← 뒤로</Text>
          </Pressable>
        ) : (showStats ? <View style={styles.sideSpacer} /> : null)}
        <Animated.View style={[styles.doodleLeft, leftAnimStyle]}>
          <DoodleDecoration type="star" size={24} seed={1} />
        </Animated.View>
        <HeroText text="WordPang" baseSize={isTablet ? 42 : 36} seedOffset={123} />
        <Animated.View style={[styles.doodleRight, rightAnimStyle]}>
          <DoodleDecoration type="star" size={24} seed={2} />
        </Animated.View>
        {showStats && onStatsPress ? (
          <Text style={styles.statsButton} onPress={onStatsPress}>📊</Text>
        ) : (showBack ? <View style={styles.sideSpacer} /> : null)}
      </View>
      <Text style={[styles.subtitle, { fontSize: isTablet ? 22 : 18 }]}>영어 단어 팡!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideSpacer: {
    width: 80,
  },
  doodleLeft: {
    marginRight: 6,
  },
  doodleRight: {
    marginLeft: 6,
  },
  title: {
    fontSize: 32,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purple,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsButton: {
    fontSize: 24,
    marginLeft: 12,
    width: 40,
    textAlign: 'center',
  },
  backButton: {
    width: 80,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  backText: {
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.purpleText,
  },
});
