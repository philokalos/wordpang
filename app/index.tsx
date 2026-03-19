import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Difficulty } from '../src/types/game';
import type { WordCategory } from '../src/types/word';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import PaperBackground from '../components/sketchy/PaperBackground';
import DoodleDecoration from '../components/sketchy/DoodleDecoration';
import SketchyButton from '../components/sketchy/SketchyButton';
import Header from '../components/Header';
import DifficultyCard from '../components/DifficultyCard';
import CategoryChip from '../components/CategoryChip';
import { useStats } from '../hooks/useStats';
import { useOnboarding } from '../hooks/useOnboarding';
import { useResponsive } from '../hooks/useResponsive';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export default function HomeScreen() {
  const router = useRouter();
  const { isTablet, maxContentWidth } = useResponsive();
  const { stats } = useStats();
  const { isLoading, isOnboardingDone } = useOnboarding();
  const [selected, setSelected] = useState<Difficulty>('normal');
  const [dailyMode, setDailyMode] = useState(false);
  const [category, setCategory] = useState<WordCategory | undefined>(undefined);

  useEffect(() => {
    if (!isLoading && !isOnboardingDone) {
      router.replace('/onboarding' as never);
    }
  }, [isLoading, isOnboardingDone, router]);

  if (isLoading || !isOnboardingDone) {
    return null;
  }

  const handleStart = () => {
    router.push({
      pathname: '/game',
      params: {
        difficulty: selected,
        daily: dailyMode ? '1' : '0',
        ...(category ? { category } : {}),
      },
    });
  };

  return (
    <PaperBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header />

        {stats.currentStreak > 0 && (
          <View style={[styles.streakBadge, SKETCHY_RADIUS.small]}>
            <Text style={styles.streakText}>
              {'\uD83D\uDD25'} {stats.currentStreak}일 연속!
            </Text>
          </View>
        )}

        <View style={[styles.content, isTablet && { maxWidth: maxContentWidth, alignSelf: 'center' }]}>
          <Text style={[styles.label, { fontSize: isTablet ? 24 : 20 }]}>난이도를 선택하세요!</Text>

          <View style={styles.cards}>
            {DIFFICULTIES.map((diff) => (
              <DifficultyCard
                key={diff}
                difficulty={diff}
                isSelected={diff === selected}
                onPress={() => setSelected(diff)}
              />
            ))}
          </View>

          <Text style={styles.categoryLabel}>주제 선택</Text>
          <CategoryChip selected={category} onSelect={setCategory} />

          <View style={[styles.dailyRow, SKETCHY_RADIUS.medium]}>
            <Text style={styles.dailyLabel}>오늘의 단어 모드</Text>
            <Switch
              value={dailyMode}
              onValueChange={setDailyMode}
              trackColor={{ false: COLORS.tileBorder, true: COLORS.purple }}
              thumbColor={dailyMode ? '#ffffff' : COLORS.surfaceAlt}
            />
          </View>

          <View style={styles.navRow}>
            <Pressable
              onPress={() => router.push('/review' as never)}
              style={({ pressed }) => [styles.navButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.navIcon}>📚</Text>
              <Text style={styles.navText}>복습</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/practice' as never)}
              style={({ pressed }) => [styles.navButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.navIcon}>🏋️</Text>
              <Text style={styles.navText}>연습</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/stats')}
              style={({ pressed }) => [styles.navButton, SKETCHY_RADIUS.medium, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Text style={styles.navIcon}>📊</Text>
              <Text style={styles.navText}>통계</Text>
            </Pressable>
          </View>

          <View style={styles.startRow}>
            <DoodleDecoration type="squiggle" size={32} seed={10} style={styles.squiggleLeft} />
            <SketchyButton
              label="시작하기"
              onPress={handleStart}
              seed={100}
              variant="primary"
              wobble
              style={styles.startButton}
            />
            <DoodleDecoration type="squiggle" size={32} seed={11} style={styles.squiggleRight} />
          </View>
        </View>
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  streakBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.present,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: COLORS.presentBorder,
  },
  streakText: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.bold,
    color: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  label: {
    fontSize: 20,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryLabel: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dailyLabel: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textPrimary,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squiggleLeft: {
    marginRight: 8,
  },
  squiggleRight: {
    marginLeft: 8,
  },
  startButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
});
