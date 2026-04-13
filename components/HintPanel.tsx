import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import type { Hint, HintType, GameStatus } from '../src/types/game';
import { MAX_HINT_POINTS } from '../src/types/game';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, FONT_SIZES } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';
import { useResponsive } from '../hooks/useResponsive';

interface HintPanelProps {
  hints: Hint[];
  hintPointsUsed: number;
  gameStatus: GameStatus;
  onRequestHint: (type: HintType) => void;
  targetWord?: string;
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
  { type: 'pronunciation', label: '발음', icon: '🔊', cost: 1 },
  { type: 'rhyming', label: '라이밍 힌트', icon: '🎵', cost: 1 },
  { type: 'letterPosition', label: '위치', icon: '📍', cost: 2 },
  { type: 'wordFamily', label: '단어 패턴', icon: '🧩', cost: 2 },
];

// Pre-compute irregular radii for hint buttons (one entry per HINT_BUTTONS item)
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
  targetWord,
}: HintPanelProps) {
  const { isTablet } = useResponsive();
  const remainingPoints = MAX_HINT_POINTS - hintPointsUsed;
  const usedHintTypes = useMemo(() => new Set(hints.map((h) => h.type)), [hints]);

  return (
    <View style={[styles.container, { maxWidth: isTablet ? 520 : 360 }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonRow}
      >
        {HINT_BUTTONS.map(({ type, label, icon, cost }, i) => {
          const used = usedHintTypes.has(type);
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

      <View style={styles.gaugeRow} accessibilityLabel={`힌트 포인트 ${hintPointsUsed}/${MAX_HINT_POINTS} 사용`}>
        <Text style={styles.gaugeLabel}>힌트</Text>
        {Array.from({ length: MAX_HINT_POINTS }).map((_, i) => (
          <View
            key={i}
            style={[styles.gaugeDot, i < hintPointsUsed ? styles.gaugeDotUsed : styles.gaugeDotFree]}
          />
        ))}
      </View>

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
              {hint.type === 'pronunciation' && targetWord && (
                <Pressable
                  onPress={() => Speech.speak(targetWord, { language: 'en-US', rate: 0.8 })}
                  style={({ pressed }) => [styles.speakBtn, SKETCHY_RADIUS.small, { opacity: pressed ? 0.7 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel="발음 듣기"
                >
                  <Text style={styles.speakBtnText}>🔊</Text>
                </Pressable>
              )}
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
    borderWidth: 1.5,
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
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.regular,
  },
  costText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.pinkText,
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gaugeLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginRight: 2,
  },
  gaugeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  gaugeDotUsed: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purpleDark,
  },
  gaugeDotFree: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.tileBorder,
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
    borderWidth: 1.5,
    borderColor: COLORS.pinkBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hintText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.pinkText,
    textAlign: 'center',
    flexShrink: 1,
  },
  speakBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.pinkBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  speakBtnText: {
    fontSize: 16,
  },
});
