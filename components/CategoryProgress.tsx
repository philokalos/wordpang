import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, CRAYON } from '../constants/theme';
import type { WordCategory } from '../src/types/word';
import type { Difficulty } from '../src/types/game';
import { getWordList } from '../src/data';
import { loadLearnedWords } from '../services/storage';

interface CategoryInfo {
  key: WordCategory;
  label: string;
  emoji: string;
  color: string;
}

const CATEGORIES: CategoryInfo[] = [
  { key: 'animal', label: '동물', emoji: '\uD83D\uDC3E', color: CRAYON.orange },
  { key: 'food', label: '음식', emoji: '\uD83C\uDF54', color: CRAYON.red },
  { key: 'school', label: '학교', emoji: '\uD83D\uDCDA', color: CRAYON.blue },
  { key: 'nature', label: '자연', emoji: '\uD83C\uDF3F', color: CRAYON.green },
  { key: 'body', label: '신체', emoji: '\uD83E\uDDB4', color: CRAYON.pink },
  { key: 'home', label: '생활', emoji: '\uD83C\uDFE0', color: CRAYON.yellow },
  { key: 'action', label: '동작', emoji: '\uD83C\uDFC3', color: CRAYON.purple },
  { key: 'feeling', label: '감정', emoji: '\uD83D\uDE0A', color: CRAYON.blueDark },
];

interface CategoryStat {
  learned: number;
  total: number;
}

function buildCategoryTotals(): Record<WordCategory, number> {
  const totals: Record<WordCategory, number> = {
    animal: 0,
    food: 0,
    school: 0,
    nature: 0,
    body: 0,
    home: 0,
    action: 0,
    feeling: 0,
  };

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  const seenWords = new Set<string>();

  for (const difficulty of difficulties) {
    const { answers } = getWordList(difficulty);
    for (const entry of answers) {
      if (!seenWords.has(entry.word)) {
        seenWords.add(entry.word);
        totals[entry.category] += 1;
      }
    }
  }

  return totals;
}

function buildWordCategoryMap(): Map<string, WordCategory> {
  const map = new Map<string, WordCategory>();
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  for (const difficulty of difficulties) {
    const { answers } = getWordList(difficulty);
    for (const entry of answers) {
      if (!map.has(entry.word)) {
        map.set(entry.word, entry.category);
      }
    }
  }

  return map;
}

export default function CategoryProgress() {
  const [categoryStats, setCategoryStats] = useState<Record<WordCategory, CategoryStat> | null>(
    null,
  );

  useEffect(() => {
    async function compute() {
      const learnedWords = await loadLearnedWords();
      const totals = buildCategoryTotals();
      const wordCategoryMap = buildWordCategoryMap();

      const learnedPerCategory: Record<WordCategory, number> = {
        animal: 0,
        food: 0,
        school: 0,
        nature: 0,
        body: 0,
        home: 0,
        action: 0,
        feeling: 0,
      };

      for (const lw of learnedWords) {
        const category = wordCategoryMap.get(lw.word);
        if (category) {
          learnedPerCategory[category] += 1;
        }
      }

      const stats = {} as Record<WordCategory, CategoryStat>;
      for (const cat of CATEGORIES) {
        stats[cat.key] = {
          learned: learnedPerCategory[cat.key],
          total: totals[cat.key],
        };
      }

      setCategoryStats(stats);
    }

    compute();
  }, []);

  if (!categoryStats) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>카테고리 진행</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => {
          const stat = categoryStats[cat.key];
          const progress = stat.total > 0 ? stat.learned / stat.total : 0;
          const progressPct = Math.round(progress * 100);

          return (
            <View key={cat.key} style={styles.categoryRow}>
              <View style={styles.categoryLabelRow}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={styles.categoryCount}>
                  {stat.learned}/{stat.total}
                </Text>
              </View>
              <View style={[styles.progressTrack, SKETCHY_RADIUS.small]}>
                <View
                  style={[
                    styles.progressFill,
                    SKETCHY_RADIUS.small,
                    {
                      width: `${Math.max(progress > 0 ? 5 : 0, progressPct)}%`,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  grid: {
    gap: 10,
  },
  categoryRow: {
    gap: 4,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  categoryCount: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
  },
  progressTrack: {
    height: 14,
    backgroundColor: COLORS.surfaceAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
  },
  progressFill: {
    height: '100%',
  },
});
