import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { GameStats } from '../services/storage';
import { COLORS } from '../constants/colors';

interface StatsDisplayProps {
  stats: GameStats;
  winRate: number;
}

export default function StatsDisplay({ stats, winRate }: StatsDisplayProps) {
  const maxDistValue = Math.max(1, ...Object.values(stats.guessDistribution));

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

          return (
            <View key={n} style={styles.distRow}>
              <Text style={styles.distLabel}>{n}</Text>
              <View style={[styles.distBar, { width: `${widthPct}%` }]}>
                <Text style={styles.distCount}>{count}</Text>
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
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  distTitle: {
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    width: 16,
    textAlign: 'right',
  },
  distBar: {
    backgroundColor: COLORS.correct,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'flex-end',
  },
  distCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
