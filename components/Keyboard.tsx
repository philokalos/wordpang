import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LetterStatus } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { KEY_HEIGHT, KEY_GAP, getKeyWidth } from '../constants/layout';

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
                  {
                    width: getKeyWidth(isSpecial),
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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 15,
    fontWeight: '700',
  },
  specialKeyText: {
    fontSize: 18,
  },
});
