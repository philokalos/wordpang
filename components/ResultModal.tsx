import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, ScrollView, Animated } from 'react-native';
import type { GameStatus, LetterStatus } from '../src/types/game';
import type { WordEntry } from '../src/types/word';
import type { Achievement } from '../src/types/achievement';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import ShareButton from './ShareButton';
import WordCard from './WordCard';
import SketchyButton from './sketchy/SketchyButton';
import HeroText from './sketchy/HeroText';

export interface NextBadgeProgress {
  icon: string;
  title: string;
  remaining: number;
  unit: string;
}

interface ResultModalProps {
  gameStatus: GameStatus;
  targetWord: WordEntry;
  attempts: number;
  maxAttempts: number;
  evaluations: LetterStatus[][];
  isDaily: boolean;
  countdown?: string;
  newAchievements?: Achievement[];
  nextBadgeProgress?: NextBadgeProgress;
  onNewGame: () => void;
  onChangeDifficulty: () => void;
  onMarkLearned?: () => void;
  onHome?: () => void;
}

const CONFETTI_PARTICLES = [
  { dx: -110, dy: -200, delay: 0,   emoji: '⭐' },
  { dx: 0,    dy: -220, delay: 40,  emoji: '🌟' },
  { dx: 110,  dy: -200, delay: 80,  emoji: '✨' },
  { dx: -160, dy: -140, delay: 20,  emoji: '⭐' },
  { dx: 160,  dy: -140, delay: 60,  emoji: '✨' },
  { dx: -60,  dy: -230, delay: 100, emoji: '🌟' },
  { dx: 60,   dy: -230, delay: 120, emoji: '⭐' },
  { dx: -140, dy: -80,  delay: 30,  emoji: '✨' },
  { dx: 140,  dy: -80,  delay: 70,  emoji: '🌟' },
  { dx: 0,    dy: -160, delay: 150, emoji: '⭐' },
];

function ConfettiBurst({ triggered }: { triggered: boolean }) {
  const anims = useRef(
    CONFETTI_PARTICLES.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.4),
    }))
  ).current;

  useEffect(() => {
    if (!triggered) return;

    anims.forEach((anim, i) => {
      const p = CONFETTI_PARTICLES[i]!;
      anim.x.setValue(0);
      anim.y.setValue(0);
      anim.opacity.setValue(0);
      anim.scale.setValue(0.4);

      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: p.dx,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: p.dy,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(anim.opacity, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
          ]),
          Animated.timing(anim.scale, { toValue: 1.3, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, [triggered, anims]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {anims.map((anim, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confettiParticle,
            {
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                { scale: anim.scale },
              ],
              opacity: anim.opacity,
            },
          ]}
        >
          {CONFETTI_PARTICLES[i]!.emoji}
        </Animated.Text>
      ))}
    </View>
  );
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
  nextBadgeProgress,
  onNewGame,
  onChangeDifficulty,
  onMarkLearned,
  onHome,
}: ResultModalProps) {
  const [marked, setMarked] = useState(false);
  const isWin = gameStatus === 'won';
  const visible = gameStatus !== 'playing';

  // Card entrance scale animation
  const cardScale = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.75);
      Animated.spring(cardScale, {
        toValue: 1,
        damping: 14,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, cardScale]);

  const handleMarkLearned = () => {
    onMarkLearned?.();
    setMarked(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Confetti burst anchored to the overlay center */}
        {isWin && (
          <View style={styles.confettiAnchor} pointerEvents="none">
            <ConfettiBurst triggered={visible && isWin} />
          </View>
        )}

        <Animated.View
          style={[styles.card, SKETCHY_RADIUS.large, { transform: [{ scale: cardScale }] }]}
          accessibilityLabel="게임 결과"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardContent}
          >
            <Text style={styles.emoji}>{isWin ? '🎉' : '😢'}</Text>
            <View style={styles.heroTextWrapper}>
              <HeroText text={isWin ? '우와! 정답이에요!' : '다음에 더 잘할 수 있어요!'} baseSize={isWin ? 38 : 34} seedOffset={isWin ? 100 : 200} />
            </View>

            {isWin && (
              <Text style={styles.attemptsText}>
                우리 친구, 정말 대단해요! {attempts}번 만에 맞혔네요! ✨
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

            {nextBadgeProgress && nextBadgeProgress.remaining > 0 && (
              <View style={[styles.badgeProgress, SKETCHY_RADIUS.small]}>
                <Text style={styles.badgeProgressText}>
                  {nextBadgeProgress.icon} {nextBadgeProgress.title}까지{' '}
                  <Text style={styles.badgeProgressBold}>{nextBadgeProgress.remaining}{nextBadgeProgress.unit}</Text> 남았어요!
                </Text>
              </View>
            )}

            {onMarkLearned && (
              <Pressable
                onPress={handleMarkLearned}
                disabled={marked}
                accessibilityRole="button"
                accessibilityLabel={marked ? '학습 완료' : '선생님, 저 이거 배웠어요'}
                style={({ pressed }) => [
                  styles.learnedButton,
                  SKETCHY_RADIUS.medium,
                  marked && styles.learnedButtonDone,
                  { opacity: pressed && !marked ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.learnedText, marked && styles.learnedTextDone]}>
                  {marked ? '머릿속에 쏙쏙! 아주 잘했어요! 🧠' : '선생님, 저 이 단어 이제 알아요!'}
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
                  <Text style={styles.countdownLabel}>조금만 기다리면 다음 단어가 나와요</Text>
                  <Text style={styles.countdownTime}>{countdown}</Text>
                  {onHome && (
                    <SketchyButton
                      label="우리 홈으로 가볼까요?"
                      onPress={onHome}
                      seed={203}
                      variant="secondary"
                      style={styles.homeButton}
                    />
                  )}
                </View>
              ) : (
                <>
                  <SketchyButton
                    label="한 번 더 해볼까요?"
                    onPress={onNewGame}
                    seed={201}
                    variant="primary"
                  />
                  <SketchyButton
                    label="난이도를 바꿔볼까요?"
                    onPress={onChangeDifficulty}
                    seed={202}
                    variant="secondary"
                  />
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
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
  confettiAnchor: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
  },
  confettiParticle: {
    position: 'absolute',
    fontSize: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: COLORS.tileBorder,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    maxHeight: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textMuted,
  },
  cardContent: {
    alignItems: 'center',
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
  heroTextWrapper: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  attemptsText: {
    fontSize: 18,
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
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.absentBorder,
    padding: 10,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementText: {
    fontSize: 17,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  badgeProgress: {
    backgroundColor: COLORS.pinkLight,
    borderWidth: 1.5,
    borderColor: COLORS.pinkBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 4,
    width: '100%',
    alignItems: 'center',
  },
  badgeProgressText: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.pinkText,
    textAlign: 'center',
  },
  badgeProgressBold: {
    fontFamily: SKETCHY_FONTS.bold,
  },
  learnedButton: {
    backgroundColor: COLORS.correctBg,
    borderWidth: 2,
    borderColor: COLORS.correct,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginVertical: 4,
  },
  learnedButtonDone: {
    backgroundColor: COLORS.correctBgActive,
    borderColor: COLORS.correctBorder,
  },
  learnedText: {
    fontSize: 18,
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
    fontSize: 16,
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
  homeButton: {
    marginTop: 12,
  },
});
