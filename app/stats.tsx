import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useStats } from '../hooks/useStats';
import StatsDisplay from '../components/StatsDisplay';

export default function StatsScreen() {
  const router = useRouter();
  const { stats, winRate } = useStats();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>통계</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <StatsDisplay stats={stats} winRate={winRate} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.purpleText,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  spacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 24,
  },
});
