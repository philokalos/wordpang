import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const unlocked = !!achievement.unlockedAt;

  return (
    <View
      style={[styles.badge, SKETCHY_RADIUS.medium, !unlocked && styles.locked]}
      accessibilityLabel={`${achievement.title}, ${unlocked ? '달성' : '미달성'}`}
      accessibilityRole="summary"
    >
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
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    padding: 14,
    gap: 12,
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
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lockedText: {
    color: COLORS.textMuted,
  },
});
