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
  const title = isUp ? '도전해 볼까요?' : '조금 쉽게 해볼까요?';
  const message = isUp
    ? '잘하고 있어요! 더 어려운 난이도에 도전해 보는 건 어떨까요?'
    : '괜찮아요! 조금 더 쉬운 난이도로 연습하면 실력이 금방 올라요!';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, SKETCHY_RADIUS.large]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <SketchyButton
              label={isUp ? '난이도 올리기' : '난이도 내리기'}
              onPress={onAccept}
              seed={301}
              variant="primary"
            />
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="괜찮아요, 지금 난이도 유지할게요"
              style={({ pressed }) => [
                styles.secondaryButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.secondaryText}>괜찮아요, 지금 난이도 유지할게요</Text>
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
    backgroundColor: COLORS.surface,
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
