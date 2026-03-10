import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import type { GameStatus, LetterStatus } from '../src/types/game';
import type { WordEntry } from '../src/types/word';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';
import ShareButton from './ShareButton';
import WordCard from './WordCard';

interface ResultModalProps {
  gameStatus: GameStatus;
  targetWord: WordEntry;
  attempts: number;
  maxAttempts: number;
  evaluations: LetterStatus[][];
  isDaily: boolean;
  countdown?: string;
  newAchievements?: Achievement[];
  onNewGame: () => void;
  onChangeDifficulty: () => void;
  onMarkLearned?: () => void;
}

export default function ResultModal({
  gameStatus,
  targetWord,
  attempts,
  maxAttempts,
  evaluations,
  isDaily,
  countdown,
  newAchievements,
  onNewGame,
  onChangeDifficulty,
  onMarkLearned,
}: ResultModalProps) {
  const [marked, setMarked] = useState(false);
  const isWin = gameStatus === 'won';
  const visible = gameStatus !== 'playing';

  const handleMarkLearned = () => {
    onMarkLearned?.();
    setMarked(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card} accessibilityLabel="게임 결과">
          <Text style={styles.emoji}>{isWin ? '🎉' : '😢'}</Text>
          <Text style={styles.title}>{isWin ? '정답!' : '아쉬워요!'}</Text>

          {isWin && (
            <Text style={styles.attemptsText}>
              {attempts}/{maxAttempts} 번 만에 맞혔어요!
            </Text>
          )}

          <WordCard word={targetWord} />

          {newAchievements && newAchievements.length > 0 && (
            <View style={styles.achievementSection}>
              {newAchievements.map((a) => (
                <View key={a.id} style={styles.achievementRow}>
                  <Text style={styles.achievementIcon}>{a.icon}</Text>
                  <Text style={styles.achievementText}>{a.title}</Text>
                </View>
              ))}
            </View>
          )}

          {onMarkLearned && (
            <Pressable
              onPress={handleMarkLearned}
              disabled={marked}
              accessibilityRole="button"
              accessibilityLabel={marked ? '학습 완료' : '이 단어 배웠어요'}
              style={({ pressed }) => [
                styles.learnedButton,
                marked && styles.learnedButtonDone,
                { opacity: pressed && !marked ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.learnedText, marked && styles.learnedTextDone]}>
                {marked ? '학습 완료!' : '이 단어 배웠어요!'}
              </Text>
            </Pressable>
          )}

          <View style={styles.actions}>
            <ShareButton
              won={isWin}
              attempts={attempts}
              maxAttempts={maxAttempts}
              evaluations={evaluations}
              isDaily={isDaily}
            />

            {isDaily && countdown ? (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>다음 단어까지</Text>
                <Text style={styles.countdownTime}>{countdown}</Text>
              </View>
            ) : (
              <>
                <Pressable
                  onPress={onNewGame}
                  accessibilityRole="button"
                  accessibilityLabel="다시 하기"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>다시 하기</Text>
                </Pressable>

                <Pressable
                  onPress={onChangeDifficulty}
                  accessibilityRole="button"
                  accessibilityLabel="난이도 변경"
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>난이도 변경</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    maxHeight: '85%',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  attemptsText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  achievementSection: {
    width: '100%',
    gap: 6,
    marginVertical: 8,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef9c3',
    padding: 10,
    borderRadius: 10,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  learnedButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#bbf7d0',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  learnedButtonDone: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  learnedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  learnedTextDone: {
    color: '#15803d',
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  secondaryButtonText: {
    color: COLORS.purpleText,
    fontSize: 16,
    fontWeight: '700',
  },
  countdownBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  countdownLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  countdownTime: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.purpleText,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
});
