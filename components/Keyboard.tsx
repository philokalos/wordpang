import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LetterStatus } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { KEY_GAP, getKeyWidth } from '../constants/layout';
import { SKETCHY_FONTS } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';
import { useResponsive } from '../hooks/useResponsive';

interface KeyboardProps {
  keyStatuses: Record<string, LetterStatus>;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const KEY_BORDER: Record<LetterStatus, string> = {
  correct: COLORS.correctBorder,
  present: COLORS.presentBorder,
  absent: COLORS.absentBorder,
};

const KEY_RADII = (() => {
  const radii: Record<string, { borderTopLeftRadius: number; borderTopRightRadius: number; borderBottomLeftRadius: number; borderBottomRightRadius: number }> = {};
  ROWS.flat().forEach((key, i) => {
    const rand = seededRandom(i * 37 + 100);
    radii[key] = {
      borderTopLeftRadius: 5 + Math.round(rand() * 5),
      borderTopRightRadius: 6 + Math.round(rand() * 5),
      borderBottomLeftRadius: 6 + Math.round(rand() * 5),
      borderBottomRightRadius: 5 + Math.round(rand() * 5),
    };
  });
  return radii;
})();

export default function Keyboard({
  keyStatuses,
  onLetter,
  onEnter,
  onBackspace,
}: KeyboardProps) {
  const { screenWidth, isTablet, keyHeight } = useResponsive();

  const handlePress = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACK') {
      onBackspace();
    } else {
      onLetter(key);
    }
  }, [onLetter, onEnter, onBackspace]);

  const specialKeyWidth = getKeyWidth(true, screenWidth);
  const normalKeyWidth = getKeyWidth(false, screenWidth);

  const renderKey = useCallback((key: string) => {
    const isSpecial = key === 'ENTER' || key === 'BACK';
    const isEnter = key === 'ENTER';
    const isBack = key === 'BACK';
    const status = isSpecial ? undefined : keyStatuses[key];
    const displayKey = key === 'BACK' ? '⌫' : key === 'ENTER' ? '↵' : key;
    
    let borderColor = status ? KEY_BORDER[status] : COLORS.keyDefaultBorder;
    if (isEnter) borderColor = COLORS.correctBorder;
    if (isBack) borderColor = COLORS.pinkBorder;
    
    const textColor = status ? KEY_BORDER[status] : COLORS.keyDefaultText;

    return (
      <Pressable
        key={key}
        onPress={() => handlePress(key)}
        style={({ pressed }) => [
          styles.key,
          KEY_RADII[key],
          {
            width: isSpecial ? specialKeyWidth : normalKeyWidth,
            height: keyHeight,
            backgroundColor: 'transparent',
            borderColor: borderColor,
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        accessibilityLabel={key === 'BACK' ? 'backspace' : key.toLowerCase()}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.keyText,
            { color: textColor, fontSize: isTablet ? 27 : 23 },
            isSpecial && { fontSize: isTablet ? 29 : 25 },
          ]}
        >
          {displayKey}
        </Text>
      </Pressable>
    );
  }, [keyStatuses, handlePress, isTablet, keyHeight, specialKeyWidth, normalKeyWidth]);

  return (
    <View style={[styles.container, { maxWidth: isTablet ? 600 : undefined }]} accessibilityLabel="keyboard">
      {ROWS.map((row, rowIndex) => {
        const hasSpecial = row.some((k) => k === 'ENTER' || k === 'BACK');
        return (
          <View key={rowIndex} style={hasSpecial ? styles.rowSpecial : styles.row}>
            {row.map((key) => renderKey(key))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: KEY_GAP,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 4,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: KEY_GAP,
    justifyContent: 'center',
  },
  rowSpecial: {
    flexDirection: 'row',
    gap: KEY_GAP,
    justifyContent: 'space-between',
    width: '100%',
  },
  key: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
  },
  keyText: {
    fontFamily: SKETCHY_FONTS.bold,
  },
});
