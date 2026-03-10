import React from 'react';
import { StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import type { DifficultyRecommendation } from '../hooks/useStats';
import { COLORS } from '../constants/colors';

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
        <View style={styles.card}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onAccept}
              style={({ pressed }) => [
                styles.primaryButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.primaryText}>
                {isUp ? '난이도 올리기' : '난이도 내리기'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDismiss}
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
    borderRadius: 20,
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
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.purple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
