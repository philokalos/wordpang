import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { WordCategory } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, FONT_SIZES } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';

const CATEGORY_CONFIG: Record<WordCategory, { label: string; icon: string }> = {
  animal: { label: '동물', icon: '🐾' },
  food: { label: '음식', icon: '🍎' },
  school: { label: '학교', icon: '📚' },
  nature: { label: '자연', icon: '🌿' },
  body: { label: '몸', icon: '🫀' },
  home: { label: '집', icon: '🏠' },
  action: { label: '동작', icon: '🏃' },
  feeling: { label: '감정', icon: '💭' },
};

const ALL_CATEGORIES: WordCategory[] = ['animal', 'food', 'school', 'nature', 'body', 'home', 'action', 'feeling'];

// Pre-compute irregular radii for each chip
const CHIP_RADII = (() => {
  const radii: Record<string, { borderTopLeftRadius: number; borderTopRightRadius: number; borderBottomLeftRadius: number; borderBottomRightRadius: number }> = {};
  ['all', ...ALL_CATEGORIES].forEach((cat, i) => {
    const rand = seededRandom(i * 13 + 50);
    radii[cat] = {
      borderTopLeftRadius: 12 + Math.round(rand() * 8),
      borderTopRightRadius: 14 + Math.round(rand() * 8),
      borderBottomLeftRadius: 13 + Math.round(rand() * 8),
      borderBottomRightRadius: 11 + Math.round(rand() * 8),
    };
  });
  return radii;
})();

interface CategoryChipProps {
  selected: WordCategory | undefined;
  onSelect: (category: WordCategory | undefined) => void;
}

export default function CategoryChip({ selected, onSelect }: CategoryChipProps) {
  return (
    <View style={styles.wrapper}>
      {/* 전체 선택 칩 — 가로 전체 차지 */}
      <Pressable
        onPress={() => onSelect(undefined)}
        accessibilityRole="button"
        accessibilityLabel="전체"
        accessibilityState={{ selected: !selected }}
        style={({ pressed }) => [
          styles.allChip,
          CHIP_RADII.all,
          !selected && styles.chipSelected,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.allIcon}>🌟</Text>
        <Text style={[styles.chipText, !selected && styles.chipTextSelected]}>
          전체
        </Text>
      </Pressable>

      {/* 4x2 그리드 */}
      <View style={styles.grid}>
        {ALL_CATEGORIES.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const isSelected = selected === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => onSelect(cat)}
              accessibilityRole="button"
              accessibilityLabel={config.label}
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.chip,
                CHIP_RADII[cat],
                isSelected && styles.chipSelected,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.chipIcon}>{config.icon}</Text>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 8,
    paddingHorizontal: 4,
  },
  allChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    backgroundColor: COLORS.surface,
  },
  allIcon: {
    fontSize: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    // 4개 per row: (100% - 3 gaps of 8px) / 4 = ~23.5%
    // Using flexBasis instead of hardcoded percentage
    flexBasis: '22%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    backgroundColor: COLORS.surface,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: COLORS.purpleBg,
    borderColor: COLORS.purple,
  },
  chipIcon: {
    fontSize: 22,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: COLORS.purpleText,
    fontFamily: SKETCHY_FONTS.bold,
  },
});
