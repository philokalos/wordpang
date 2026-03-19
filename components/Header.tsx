import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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

interface HeaderProps {
  showStats?: boolean;
  onStatsPress?: () => void;
}

export default function Header({ showStats, onStatsPress }: HeaderProps) {
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
        {showStats && <View style={styles.spacer} />}
        <Animated.View style={[styles.doodleLeft, leftAnimStyle]}>
          <DoodleDecoration type="star" size={20} seed={1} />
        </Animated.View>
        <Text style={[styles.title, { fontSize: isTablet ? 38 : 32 }]}>WordPang</Text>
        <Animated.View style={[styles.doodleRight, rightAnimStyle]}>
          <DoodleDecoration type="star" size={20} seed={2} />
        </Animated.View>
        {showStats && onStatsPress && (
          <Text style={styles.statsButton} onPress={onStatsPress}>📊</Text>
        )}
      </View>
      <Text style={[styles.subtitle, { fontSize: isTablet ? 18 : 15 }]}>영어 단어 팡!</Text>
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
  spacer: {
    width: 40,
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
});
