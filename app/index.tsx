import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Difficulty } from '../src/types/game';
import type { WordCategory } from '../src/types/word';
import { COLORS } from '../constants/colors';
import Header from '../components/Header';
import DifficultyCard from '../components/DifficultyCard';
import CategoryChip from '../components/CategoryChip';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export default function HomeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Difficulty>('normal');
  const [dailyMode, setDailyMode] = useState(false);
  const [category, setCategory] = useState<WordCategory | undefined>(undefined);

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.label}>난이도를 선택하세요!</Text>

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

        <View style={styles.dailyRow}>
          <Text style={styles.dailyLabel}>오늘의 단어 모드</Text>
          <Switch
            value={dailyMode}
            onValueChange={setDailyMode}
            trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }}
            thumbColor={dailyMode ? COLORS.purple : '#f3f4f6'}
          />
        </View>

        <View style={styles.navRow}>
          <Pressable
            onPress={() => router.push('/review' as never)}
            style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.navIcon}>📚</Text>
            <Text style={styles.navText}>복습</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/practice' as never)}
            style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.navIcon}>🏋️</Text>
            <Text style={styles.navText}>연습</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/stats')}
            style={({ pressed }) => [styles.navButton, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text style={styles.navText}>통계</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dailyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  startButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
