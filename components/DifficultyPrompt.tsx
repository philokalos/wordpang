import React from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import type { DifficultyRecommendation } from '../hooks/useStats';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import SketchyButton from './sketchy/SketchyButton';

interface DifficultyPromptProps {
  visible: boolean;
  recommendation: DifficultyRecommendation;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function DifficultyPrompt({
  visible,
  recommendation,
  onAccept,
  onDismiss,
}: DifficultyPromptProps) {
  if (!recommendation) return null;

  const isUp = recommendation === 'up';
  const emoji = isUp ? '🚀' : '🌱';
  const title = isUp ? '우리, 한 단계 더 도전해 볼까요?' : '선생님이 조금 더 쉬운 문제를 내줄까요?';
  const message = isUp
    ? '정말 잘하고 있어요! 우리 친구, 한 단계 더 어려운 문제도 거뜬히 풀 수 있을 것 같은데요? 😎'
    : '문제가 조금 어려웠나요? 괜찮아요! 차근차근 연습하면 금방 단어 달인이 될 거예요! 🌱';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, SKETCHY_RADIUS.large]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <SketchyButton
              label={isUp ? '네! 더 어려운 거 해볼래요!' : '네! 조금 쉬운 걸로 할래요!'}
              onPress={onAccept}
              seed={301}
              variant="primary"
            />
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="아니요, 지금 이대로가 딱 좋아요!"
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.secondaryText}>아니요, 지금 이대로가 딱 좋아요!</Text>
            </Pressable>
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
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    padding: 28,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
  },
});
