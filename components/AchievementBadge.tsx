import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, FONT_SIZES } from '../constants/theme';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const unlocked = !!achievement.unlockedAt;

  return (
    <View
      style={[styles.badge, SKETCHY_RADIUS.medium, !unlocked && styles.locked]}
      accessibilityLabel={`${achievement.title}, ${unlocked ? '달성' : '미달성: ' + achievement.description}`}
      accessibilityRole="summary"
    >
      <Text style={[styles.icon, !unlocked && styles.lockedIcon]}>
        {unlocked ? achievement.icon : '🔒'}
      </Text>
      <View style={styles.info}>
        <Text style={[styles.title, !unlocked && styles.lockedText]}>
          {achievement.title}
        </Text>
        {unlocked ? (
          <Text style={styles.description}>{achievement.description}</Text>
        ) : (
          <View style={styles.conditionRow}>
            <Text style={styles.conditionLabel}>달성 조건</Text>
            <Text style={styles.conditionText}>{achievement.description}</Text>
          </View>
        )}
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
    backgroundColor: COLORS.surfaceAlt,
    borderStyle: 'dashed',
  },
  icon: {
    fontSize: 28,
  },
  lockedIcon: {
    opacity: 0.6,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  lockedText: {
    color: COLORS.textMuted,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  conditionLabel: {
    fontSize: 11,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purple,
    backgroundColor: COLORS.purpleBg,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    flex: 1,
  },
});
