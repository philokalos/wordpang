import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useStats } from '../hooks/useStats';
import { useAchievements } from '../hooks/useAchievements';
import StatsDisplay from '../components/StatsDisplay';
import AchievementBadge from '../components/AchievementBadge';

export default function StatsScreen() {
  const router = useRouter();
  const { stats, winRate } = useStats();
  const { achievements, unlockedCount, totalCount } = useAchievements();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>통계</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <StatsDisplay stats={stats} winRate={winRate} />

        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>
            배지 ({unlockedCount}/{totalCount})
          </Text>
          <View style={styles.badgeList}>
            {achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </View>
        </View>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  achievementSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badgeList: {
    gap: 8,
  },
});
