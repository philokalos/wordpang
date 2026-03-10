import React from 'react';
import { StyleSheet, Text, ScrollView, Pressable } from 'react-native';
import type { WordCategory } from '../src/types/word';
import { COLORS } from '../constants/colors';

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

interface CategoryChipProps {
  selected: WordCategory | undefined;
  onSelect: (category: WordCategory | undefined) => void;
}

export default function CategoryChip({ selected, onSelect }: CategoryChipProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <Pressable
        onPress={() => onSelect(undefined)}
        accessibilityRole="button"
        accessibilityLabel="전체"
        accessibilityState={{ selected: !selected }}
        style={[styles.chip, !selected && styles.chipSelected]}
      >
        <Text style={[styles.chipText, !selected && styles.chipTextSelected]}>
          전체
        </Text>
      </Pressable>
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
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {config.icon} {config.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: COLORS.surface,
  },
  chipSelected: {
    backgroundColor: COLORS.purpleBg,
    borderColor: COLORS.purple,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.purpleText,
  },
});
