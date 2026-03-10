import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Difficulty } from '../src/types/game';
import { COLORS } from '../constants/colors';
import Header from '../components/Header';
import DifficultyCard from '../components/DifficultyCard';

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export default function HomeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Difficulty>('normal');
  const [dailyMode, setDailyMode] = useState(false);

  const handleStart = () => {
    router.push({
      pathname: '/game',
      params: { difficulty: selected, daily: dailyMode ? '1' : '0' },
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

        <View style={styles.dailyRow}>
          <Text style={styles.dailyLabel}>오늘의 단어 모드</Text>
          <Switch
            value={dailyMode}
            onValueChange={setDailyMode}
            trackColor={{ false: '#e5e7eb', true: '#c4b5fd' }}
            thumbColor={dailyMode ? COLORS.purple : '#f3f4f6'}
          />
        </View>

        <Text
          style={styles.startButton}
          onPress={handleStart}
        >
          시작하기
        </Text>
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
    gap: 24,
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
  startButton: {
    backgroundColor: COLORS.purple,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    textAlign: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
