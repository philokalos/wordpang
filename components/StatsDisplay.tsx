import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { GameStats } from '../services/storage';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';

interface StatsDisplayProps {
  stats: GameStats;
  winRate: number;
}

function findMostCommonGuess(distribution: Record<number, number>): number | null {
  let maxCount = 0;
  let maxGuess: number | null = null;
  for (const [guess, count] of Object.entries(distribution)) {
    if (count > maxCount) {
      maxCount = count;
      maxGuess = Number(guess);
    }
  }
  return maxGuess;
}

export default function StatsDisplay({ stats, winRate }: StatsDisplayProps) {
  const maxDistValue = Math.max(1, ...Object.values(stats.guessDistribution));
  const mostCommonGuess = findMostCommonGuess(stats.guessDistribution);

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <StatBox label="게임" value={stats.totalPlayed} />
        <StatBox label="승률" value={`${winRate}%`} />
        <StatBox label="연속" value={stats.currentStreak} />
        <StatBox label="최대" value={stats.maxStreak} />
      </View>

      <Text style={styles.distTitle}>추측 분포</Text>
      <View style={styles.distribution}>
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const count = stats.guessDistribution[n] ?? 0;
          const widthPct = count > 0 ? Math.max(15, (count / maxDistValue) * 100) : 15;
          const isHighlighted = n === mostCommonGuess && count > 0;

          return (
            <View key={n} style={styles.distRow}>
              <Text style={[styles.distLabel, isHighlighted && styles.distLabelHighlight]}>
                {n}
              </Text>
              <View
                style={[
                  styles.distBar,
                  SKETCHY_RADIUS.small,
                  { width: `${widthPct}%` },
                  isHighlighted && styles.distBarHighlight,
                ]}
              >
                <Text style={[styles.distCount, isHighlighted && styles.distCountHighlight]}>{count}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  distTitle: {
    fontSize: 18,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  distribution: {
    gap: 4,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distLabel: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
    width: 16,
    textAlign: 'right',
  },
  distBar: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'flex-end',
  },
  distBarHighlight: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.purpleDark,
  },
  distLabelHighlight: {
    color: COLORS.purpleDark,
  },
  distCount: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
  },
  distCountHighlight: {
    color: COLORS.purpleDark,
  },
});
