import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS } from '../constants/theme';
import { useStats } from '../hooks/useStats';
import { useAchievements } from '../hooks/useAchievements';
import PaperBackground from '../components/sketchy/PaperBackground';
import StatsDisplay from '../components/StatsDisplay';
import AchievementBadge from '../components/AchievementBadge';
import CategoryProgress from '../components/CategoryProgress';
import BackupPanel from '../components/BackupPanel';

export default function StatsScreen() {
  const router = useRouter();
  const { stats, winRate } = useStats();
  const { achievements, unlockedCount, totalCount } = useAchievements();

  return (
    <PaperBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
          </Pressable>
          <Text style={styles.title}>통계</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <StatsDisplay stats={stats} winRate={winRate} />

          <CategoryProgress />

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

          <BackupPanel />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.purpleText,
  },
  title: {
    fontSize: 22,
    fontFamily: SKETCHY_FONTS.bold,
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
    fontSize: 20,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  badgeList: {
    gap: 8,
  },
});
