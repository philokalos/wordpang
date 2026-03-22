import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import type { Hint, HintType, GameStatus } from '../src/types/game';
import { MAX_HINT_POINTS } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';
import { useResponsive } from '../hooks/useResponsive';

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

  { type: 'rhyming', label: '라이밍 힌트', icon: '🎵', cost: 1 },
  { type: 'letterPosition', label: '위치', icon: '📍', cost: 2 },
  { type: 'wordFamily', label: '단어 패턴', icon: '🧩', cost: 2 },
];

// Pre-compute irregular radii for hint buttons
const HINT_RADII = HINT_BUTTONS.map((_, i) => {
  const rand = seededRandom(i * 17 + 200);
  return {
    borderTopLeftRadius: 12 + Math.round(rand() * 8),
    borderTopRightRadius: 14 + Math.round(rand() * 8),
    borderBottomLeftRadius: 13 + Math.round(rand() * 8),
    borderBottomRightRadius: 11 + Math.round(rand() * 8),
  };
});

export default function HintPanel({
  hints,
  hintPointsUsed,
  gameStatus,
  onRequestHint,
}: HintPanelProps) {
  const { isTablet } = useResponsive();
  const remainingPoints = MAX_HINT_POINTS - hintPointsUsed;

  return (
    <View style={[styles.container, { maxWidth: isTablet ? 520 : 360 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonRow}
      >
        {HINT_BUTTONS.map(({ type, label, icon, cost }, i) => {
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
                HINT_RADII[i],
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
        <ScrollView
          style={styles.hintScroll}
          contentContainerStyle={styles.hintList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {hints.map((hint, i) => (
            <View key={i} style={[styles.hintCard, SKETCHY_RADIUS.small]}>
              <Text style={styles.hintText}>{hint.content}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    width: '100%',
    maxWidth: 400,
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
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.tileBorder,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
  },
  costText: {
    fontSize: 11,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.pinkText,
  },
  counter: {
    fontSize: 12,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
  },
  hintScroll: {
    maxHeight: 96,
    width: '100%',
  },
  hintList: {
    gap: 6,
  },
  hintCard: {
    backgroundColor: COLORS.pinkLight,
    borderWidth: 1,
    borderColor: COLORS.pinkBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintText: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.pinkText,
    textAlign: 'center',
  },
});
