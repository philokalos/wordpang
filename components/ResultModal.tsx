import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import type { GameStatus, LetterStatus } from '../src/types/game';
import type { WordEntry } from '../src/types/word';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import ShareButton from './ShareButton';
import WordCard from './WordCard';
import SketchyButton from './sketchy/SketchyButton';
import DoodleDecoration from './sketchy/DoodleDecoration';

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
        <View style={[styles.card, SKETCHY_RADIUS.large]} accessibilityLabel="게임 결과">
          {isWin && (
            <View style={styles.celebrationRow}>
              <DoodleDecoration type="star" size={22} seed={301} color="#FFD54F" style={styles.celebrationStar} />
              <DoodleDecoration type="star" size={16} seed={302} color="#FF8A65" style={styles.celebrationStarSmall} />
              <DoodleDecoration type="star" size={18} seed={303} color="#AED581" />
              <DoodleDecoration type="star" size={22} seed={304} color="#4FC3F7" style={styles.celebrationStar} />
              <DoodleDecoration type="star" size={14} seed={305} color="#CE93D8" style={styles.celebrationStarSmall} />
            </View>
          )}
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
                <View key={a.id} style={[styles.achievementRow, SKETCHY_RADIUS.small]}>
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
                SKETCHY_RADIUS.medium,
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
                <SketchyButton
                  label="다시 하기"
                  onPress={onNewGame}
                  seed={201}
                  variant="primary"
                />
                <SketchyButton
                  label="난이도 변경"
                  onPress={onChangeDifficulty}
                  seed={202}
                  variant="secondary"
                />
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
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    maxHeight: '85%',
  },
  celebrationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  celebrationStar: {
    marginTop: 4,
  },
  celebrationStarSmall: {
    marginTop: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  attemptsText: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
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
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
    padding: 10,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementText: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  learnedButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: COLORS.correct,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginVertical: 4,
  },
  learnedButtonDone: {
    backgroundColor: '#C8E6C9',
    borderColor: COLORS.correctBorder,
  },
  learnedText: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.correctBorder,
  },
  learnedTextDone: {
    color: COLORS.correctBorder,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  countdownBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  countdownLabel: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
  },
  countdownTime: {
    fontSize: 30,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.purpleText,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
});
