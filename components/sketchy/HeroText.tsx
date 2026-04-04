import React, { useMemo } from 'react';
import { StyleSheet, View, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SKETCHY_FONTS } from '../../constants/theme';
import { seededRandom } from '../../utils/sketchy';

interface HeroTextProps {
  text: string;
  baseSize?: number;
  seedOffset?: number;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// Select vibrant crayon colors for letters, skipping dull tones
const HERO_COLORS = [
  COLORS.pinkText,
  COLORS.purpleDark,
  COLORS.correctBorder, // Vibrant green
  '#F57C00', // Orange
  '#FF3366', // Bright Red-Pink
  '#1976D2', // Blue
  '#BA68C8', // Light Purple
];

export default function HeroText({
  text,
  baseSize = 42,
  seedOffset = 0,
  containerStyle,
  textStyle,
}: HeroTextProps) {
  const characters = text.split('');

  const renderChars = useMemo(() => {
    return characters.map((char, index) => {
      // Preserve spaces properly
      if (char === ' ') {
        return <View key={`space-${index}`} style={{ width: baseSize * 0.3 }} />;
      }

      // Generate stable random values for this character
      const rand = seededRandom(index * 47 + seedOffset + 100);
      const colorIndex = Math.floor(rand() * HERO_COLORS.length);
      const color = HERO_COLORS[colorIndex];
      
      const rotMax = 8;
      const rotation = -rotMax + rand() * (rotMax * 2);
      
      const yMax = baseSize * 0.1;
      const translateY = -yMax + rand() * (yMax * 2);
      
      // Slight size variation: 0.9x to 1.1x
      const sizeOffset = 0.9 + (rand() * 0.2);

      return (
        <Text
          key={`${char}-${index}`}
          style={[
            styles.baseText,
            textStyle,
            {
              fontSize: baseSize * sizeOffset,
              color,
              transform: [
                { translateY },
                { rotate: `${rotation}deg` }
              ],
            },
          ]}
        >
          {char}
        </Text>
      );
    });
  }, [characters, baseSize, seedOffset, textStyle]);

  return (
    <View
      style={[styles.container, containerStyle]}
      accessible={true}
      accessibilityLabel={text}
      accessibilityRole="text"
    >
      {renderChars}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  baseText: {
    fontFamily: SKETCHY_FONTS.bold,
  },
});
