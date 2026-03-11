import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LetterStatus } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { KEY_HEIGHT, KEY_GAP, getKeyWidth } from '../constants/layout';
import { SKETCHY_FONTS } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';

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

const KEY_BG: Record<LetterStatus, string> = {
  correct: COLORS.correct,
  present: COLORS.present,
  absent: COLORS.absent,
};

// Pre-compute irregular border radii for all keys
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

  const specialKeyWidth = useMemo(() => getKeyWidth(true), []);
  const normalKeyWidth = useMemo(() => getKeyWidth(false), []);

  return (
    <View style={styles.container} accessibilityLabel="keyboard">
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACK';
            const status = isSpecial ? undefined : keyStatuses[key];
            const displayKey = key === 'BACK' ? '⌫' : key === 'ENTER' ? '↵' : key;
            const bgColor = status ? KEY_BG[status] : COLORS.keyDefault;
            const textColor = status ? COLORS.keyStatusText : COLORS.keyDefaultText;

            return (
              <Pressable
                key={key}
                onPress={() => handlePress(key)}
                style={({ pressed }) => [
                  styles.key,
                  KEY_RADII[key],
                  {
                    width: isSpecial ? specialKeyWidth : normalKeyWidth,
                    backgroundColor: bgColor,
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
                    { color: textColor },
                    isSpecial && styles.specialKeyText,
                  ]}
                >
                  {displayKey}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: KEY_GAP,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    gap: KEY_GAP,
    justifyContent: 'center',
  },
  key: {
    height: KEY_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
  },
  keyText: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
  },
  specialKeyText: {
    fontSize: 18,
  },
});
