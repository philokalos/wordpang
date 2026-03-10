import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import type { Hint, HintType, GameStatus } from '../src/types/game';
import { MAX_HINT_POINTS } from '../src/types/game';
import { COLORS } from '../constants/colors';

interface HintPanelProps {
  hints: Hint[];
  hintPointsUsed: number;
  gameStatus: GameStatus;
  onRequestHint: (type: HintType) => void;
}

interface HintButtonConfig {
  type: HintType;
  label: string;
  icon: string;
  cost: number;
}

const HINT_BUTTONS: HintButtonConfig[] = [
  { type: 'example', label: '예문', icon: '📝', cost: 1 },
  { type: 'firstLetter', label: '첫 글자', icon: '🔤', cost: 1 },
  { type: 'vowelCount', label: '모음 수', icon: '🔢', cost: 1 },
  { type: 'meaning', label: '뜻', icon: '💡', cost: 1 },
  { type: 'letterPosition', label: '위치', icon: '📍', cost: 2 },
];

export default function HintPanel({
  hints,
  hintPointsUsed,
  gameStatus,
  onRequestHint,
}: HintPanelProps) {
  const remainingPoints = MAX_HINT_POINTS - hintPointsUsed;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonRow}
      >
        {HINT_BUTTONS.map(({ type, label, icon, cost }) => {
          const used = hints.some((h) => h.type === type);
          const cantAfford = cost > remainingPoints;
          const disabled = gameStatus !== 'playing' || used || cantAfford;

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
              accessibilityRole="button"
              accessibilityLabel={`${label} 힌트`}
              accessibilityState={{ disabled }}
            >
              <Text style={styles.buttonText}>
                {icon} {label}
              </Text>
              {cost > 1 && <Text style={styles.costText}>x{cost}</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.counter}>
        힌트 포인트 {hintPointsUsed}/{MAX_HINT_POINTS}
      </Text>

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
    gap: 6,
    paddingHorizontal: 4,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    fontSize: 12,
    fontWeight: '600',
  },
  costText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.pinkText,
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
