import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const unlocked = !!achievement.unlockedAt;

  return (
    <View style={[styles.badge, !unlocked && styles.locked]}>
      <Text style={styles.icon}>{unlocked ? achievement.icon : '🔒'}</Text>
      <View style={styles.info}>
        <Text style={[styles.title, !unlocked && styles.lockedText]}>
          {achievement.title}
        </Text>
        <Text style={[styles.description, !unlocked && styles.lockedText]}>
          {achievement.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  locked: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lockedText: {
    color: COLORS.textMuted,
  },
});
