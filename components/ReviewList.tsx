import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import type { ReviewEntry } from '../src/types/review';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import DoodleDecoration from './sketchy/DoodleDecoration';

interface ReviewListProps {
  entries: ReviewEntry[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '새 단어', color: '#1976D2', bg: 'transparent' },
  learning: { label: '학습 중', color: '#F57C00', bg: 'transparent' },
  mastered: { label: '마스터', color: '#388E3C', bg: 'transparent' },
};

export default function ReviewList({ entries }: ReviewListProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyDoodleRow}>
          <DoodleDecoration type="star" size={18} seed={30} />
          <Text style={styles.emptyEmoji}>📚</Text>
          <DoodleDecoration type="star" size={18} seed={31} />
        </View>
        <Text style={styles.emptyText}>아직 학습한 단어가 없어요</Text>
        <Text style={styles.emptySubtext}>게임에서 &quot;배웠어요&quot; 버튼을 눌러보세요!</Text>
        <DoodleDecoration type="squiggle" size={48} seed={32} style={styles.emptySquiggle} />
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.word}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const config = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.new;
        return (
          <View style={[styles.item, SKETCHY_RADIUS.medium]}>
            <Text style={styles.word}>{item.word}</Text>
            <View style={[styles.badge, SKETCHY_RADIUS.small, { backgroundColor: config.bg }]}>
              <Text style={[styles.badgeText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    padding: 14,
  },
  word: {
    fontSize: 20,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyDoodleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emptySquiggle: {
    marginTop: 16,
    opacity: 0.5,
  },
});
