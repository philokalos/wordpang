import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSketchyStyle } from '../../hooks/useSketchyStyle';
import { SKETCHY_FONTS, CRAYON } from '../../constants/theme';
import { WOBBLE_ROTATION, WOBBLE_DURATION, EASING } from '../../constants/animations';

interface SketchyButtonProps {
  label: string;
  onPress: () => void;
  seed?: number;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  wobble?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  icon?: string;
}

const VARIANT_STYLES = {
  primary: {
    bg: CRAYON.purple,
    border: CRAYON.purpleDark,
    text: '#ffffff',
  },
  secondary: {
    bg: CRAYON.paperWhite,
    border: CRAYON.pencilLine,
    text: CRAYON.inkBrown,
  },
  danger: {
    bg: '#FFEBEE',
    border: CRAYON.red,
    text: CRAYON.redDark,
  },
  success: {
    bg: '#E8F5E9',
    border: CRAYON.green,
    text: CRAYON.greenDark,
  },
} as const;

export default function SketchyButton({
  label,
  onPress,
  seed = 99,
  variant = 'primary',
  disabled = false,
  wobble = false,
  style,
  textStyle,
  accessibilityLabel,
  icon,
}: SketchyButtonProps) {
  const sketchyStyle = useSketchyStyle({ seed, radiusSize: 'medium', rotation: true, maxRotation: 0.8 });
  const colors = VARIANT_STYLES[variant];

  const wobbleRotation = useSharedValue(0);

  useEffect(() => {
    if (wobble) {
      wobbleRotation.value = withRepeat(
        withSequence(
          withTiming(WOBBLE_ROTATION, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
          withTiming(-WOBBLE_ROTATION, { duration: WOBBLE_DURATION / 2, easing: EASING.wobble }),
          withTiming(0, { duration: WOBBLE_DURATION / 4, easing: EASING.wobble }),
        ),
        -1,
      );
    } else {
      wobbleRotation.value = 0;
    }
  }, [wobble, wobbleRotation]);

  const wobbleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobbleRotation.value}deg` }],
  }));

  const button = (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        sketchyStyle,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          transform: [
            ...(sketchyStyle.transform as Array<{ rotate: string }> ?? []),
            { scale: pressed ? 0.96 : 1 },
          ],
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }, textStyle]}>
        {icon ? `${icon} ${label}` : label}
      </Text>
    </Pressable>
  );

  if (wobble) {
    return <Animated.View style={wobbleAnimStyle}>{button}</Animated.View>;
  }

  return button;
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
  },
});
