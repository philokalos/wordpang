import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import type { Hint, HintType, GameStatus } from '../src/types/game';
import { COLORS } from '../constants/colors';

interface HintPanelProps {
  hints: Hint[];
  hintsUsed: number;
  maxHints: number;
  gameStatus: GameStatus;
  onRequestHint: (type: HintType) => void;
}

interface HintButtonConfig {
  type: HintType;
  label: string;
  icon: string;
}

const HINT_BUTTONS: HintButtonConfig[] = [
  { type: 'example', label: '예문', icon: '📝' },
  { type: 'firstLetter', label: '첫 글자', icon: '🔤' },
  { type: 'vowelCount', label: '모음 수', icon: '🔢' },
];

export default function HintPanel({
  hints,
  hintsUsed,
  maxHints,
  gameStatus,
  onRequestHint,
}: HintPanelProps) {
  const canUseHint = hintsUsed < maxHints && gameStatus === 'playing';

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {HINT_BUTTONS.map(({ type, label, icon }) => {
          const used = hints.some((h) => h.type === type);
          const disabled = !canUseHint || used;

          return (
            <Pressable
              key={type}
              onPress={() => onRequestHint(type)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.button,
                disabled ? styles.buttonDisabled : styles.buttonEnabled,
                { opacity: pressed && !disabled ? 0.7 : 1 },
              ]}
              accessibilityLabel={`get ${type} hint`}
            >
              <Text style={styles.buttonText}>
                {icon} {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.counter}>힌트 {hintsUsed}/{maxHints}</Text>

      {hints.length > 0 && (
        <View style={styles.hintList}>
          {hints.map((hint, i) => (
            <View key={i} style={styles.hintCard}>
              <Text style={styles.hintText}>{hint.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  buttonEnabled: {
    backgroundColor: COLORS.pinkLight,
    borderColor: COLORS.pinkBorder,
  },
  buttonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  counter: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  hintList: {
    gap: 6,
    width: '100%',
  },
  hintCard: {
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: COLORS.pinkBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.pinkText,
    textAlign: 'center',
  },
});
