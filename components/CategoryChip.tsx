import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, type ImageSourcePropType } from 'react-native';
import type { WordCategory } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, FONT_SIZES } from '../constants/theme';
import { seededRandom } from '../utils/sketchy';

const CATEGORY_CONFIG: Record<WordCategory, { label: string; icon?: string; image?: ImageSourcePropType }> = {
  animal: { label: '동물', image: require('../assets/categories/animal.png') },
  food: { label: '음식', image: require('../assets/categories/food.png') },
  school: { label: '학교', image: require('../assets/categories/school.png') },
  nature: { label: '자연', image: require('../assets/categories/nature.png') },
  body: { label: '몸', image: require('../assets/categories/body.png') },
  home: { label: '집', image: require('../assets/categories/home.png') },
  action: { label: '동작', image: require('../assets/categories/action.png') },
  feeling: { label: '감정', image: require('../assets/categories/feeling.png') },
};

const ALL_CATEGORY_IMAGE = require('../assets/categories/all.png');

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 전체 선택 칩 */}
        <Pressable
          onPress={() => onSelect(undefined)}
          accessibilityRole="button"
          accessibilityLabel="전체"
          accessibilityState={{ selected: !selected }}
          style={({ pressed }) => [
            styles.chip,
            CHIP_RADII.all,
            !selected && styles.chipSelected,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Image source={ALL_CATEGORY_IMAGE} style={styles.chipImage} />
          <Text style={[styles.chipText, !selected && styles.chipTextSelected]}>
            전체
          </Text>
        </Pressable>

        {/* 각 카테고리 칩 */}
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
              {config.image ? (
                <Image source={config.image} style={styles.chipImage} />
              ) : (
                <Text style={styles.chipIcon}>{config.icon}</Text>
              )}
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chip: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.absentBorder,
    backgroundColor: 'transparent',
    gap: 2,
  },
  chipSelected: {
    borderColor: COLORS.purpleDark,
    borderWidth: 2.5,
    backgroundColor: COLORS.surfaceAlt,
  },
  chipIcon: {
    fontSize: 32,
  },
  chipImage: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  chipText: {
    fontSize: FONT_SIZES.sm * 0.8,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: COLORS.purpleText,
    fontFamily: SKETCHY_FONTS.bold,
  },
});
