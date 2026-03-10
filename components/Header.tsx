import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface HeaderProps {
  showStats?: boolean;
  onStatsPress?: () => void;
}

export default function Header({ showStats, onStatsPress }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {showStats && <View style={styles.spacer} />}
        <Text style={styles.title}>🌸 WordPop 🌸</Text>
        {showStats && onStatsPress && (
          <Text style={styles.statsButton} onPress={onStatsPress}>📊</Text>
        )}
      </View>
      <Text style={styles.subtitle}>영어 단어 팝!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.purple,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statsButton: {
    fontSize: 24,
    marginLeft: 12,
    width: 40,
    textAlign: 'center',
  },
});
