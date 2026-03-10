import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import type { ReviewEntry } from '../src/types/review';
import { COLORS } from '../constants/colors';

interface ReviewListProps {
  entries: ReviewEntry[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '새 단어', color: '#3b82f6', bg: '#eff6ff' },
  learning: { label: '학습 중', color: '#f59e0b', bg: '#fffbeb' },
  mastered: { label: '마스터', color: '#22c55e', bg: '#f0fdf4' },
};

export default function ReviewList({ entries }: ReviewListProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyText}>아직 학습한 단어가 없어요</Text>
        <Text style={styles.emptySubtext}>게임에서 "배웠어요" 버튼을 눌러보세요!</Text>
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
          <View style={styles.item}>
            <Text style={styles.word}>{item.word}</Text>
            <View style={[styles.badge, { backgroundColor: config.bg }]}>
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
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  word: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
