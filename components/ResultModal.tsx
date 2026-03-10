import React from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import type { GameStatus, LetterStatus } from '../src/types/game';
import type { WordEntry } from '../src/types/word';
import { COLORS } from '../constants/colors';
import ShareButton from './ShareButton';

interface ResultModalProps {
  gameStatus: GameStatus;
  targetWord: WordEntry;
  attempts: number;
  maxAttempts: number;
  evaluations: LetterStatus[][];
  isDaily: boolean;
  countdown?: string;
  onNewGame: () => void;
  onChangeDifficulty: () => void;
}

export default function ResultModal({
  gameStatus,
  targetWord,
  attempts,
  maxAttempts,
  evaluations,
  isDaily,
  countdown,
  onNewGame,
  onChangeDifficulty,
}: ResultModalProps) {
  const isWin = gameStatus === 'won';
  const visible = gameStatus !== 'playing';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>{isWin ? '🎉' : '😢'}</Text>
          <Text style={styles.title}>{isWin ? '정답!' : '아쉬워요!'}</Text>

          {isWin && (
            <Text style={styles.attemptsText}>
              {attempts}/{maxAttempts} 번 만에 맞혔어요!
            </Text>
          )}

          <View style={styles.wordCard}>
            <Text style={styles.word}>{targetWord.word}</Text>
            <Text style={styles.meaning}>{targetWord.meaning}</Text>
            <Text style={styles.pronunciation}>[{targetWord.pronunciation}]</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.example}>"{targetWord.example}"</Text>
            </View>
          </View>

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
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>다시 하기</Text>
                </Pressable>

                <Pressable
                  onPress={onChangeDifficulty}
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
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
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
    marginBottom: 8,
  },
  wordCard: {
    backgroundColor: COLORS.purpleBg,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  word: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.purpleText,
    letterSpacing: 3,
  },
  meaning: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  pronunciation: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  exampleBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    width: '100%',
  },
  example: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
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
