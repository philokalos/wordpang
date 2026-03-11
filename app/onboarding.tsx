import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS, CRAYON } from '../constants/theme';
import PaperBackground from '../components/sketchy/PaperBackground';
import DoodleDecoration from '../components/sketchy/DoodleDecoration';
import SketchyButton from '../components/sketchy/SketchyButton';
import { useOnboarding } from '../hooks/useOnboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Styles (defined first so page content JSX can reference them) ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  pageContent: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
  },
  description: {
    fontSize: 18,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  squiggleLeft: {
    marginRight: 8,
  },
  squiggleRight: {
    marginLeft: 8,
  },
  // Screen 1
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  appName: {
    fontSize: 42,
    fontFamily: SKETCHY_FONTS.bold,
    color: CRAYON.purple,
  },
  // Screen 2
  tileContent: {
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  tileLetter: {
    fontSize: 22,
    fontFamily: SKETCHY_FONTS.bold,
    color: '#ffffff',
  },
  legendList: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
  },
  // Screen 3
  hintContent: {
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  hintGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  hintItem: {
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  hintEmoji: {
    fontSize: 28,
  },
  hintLabel: {
    fontSize: 13,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  pointBadge: {
    backgroundColor: CRAYON.paperDark,
    borderWidth: 1.5,
    borderColor: CRAYON.pencilLine,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pointText: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textSecondary,
  },
  // Screen 4
  readyContent: {
    gap: 14,
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 18,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textPrimary,
  },
});

// ── Helper components ──

interface OnboardingPage {
  title: string;
  description: string;
  content: React.ReactNode;
}

function TileExample({ letter, color, borderColor }: { letter: string; color: string; borderColor: string }) {
  return (
    <View style={[styles.tile, SKETCHY_RADIUS.small, { backgroundColor: color, borderColor }]}>
      <Text style={styles.tileLetter}>{letter}</Text>
    </View>
  );
}

function HintItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={styles.hintItem}>
      <Text style={styles.hintEmoji}>{emoji}</Text>
      <Text style={styles.hintLabel}>{label}</Text>
    </View>
  );
}

// ── Page definitions ──

const PAGES: OnboardingPage[] = [
  {
    title: '워드팝에 오신 걸\n환영해요! 🎉',
    description: '영어 단어를 재미있게 배우는\n퍼즐 게임이에요',
    content: (
      <View style={styles.welcomeContent}>
        <DoodleDecoration type="star" size={48} color={CRAYON.yellow} seed={1} />
        <Text style={styles.appName}>WordPop</Text>
        <DoodleDecoration type="star" size={48} color={CRAYON.pink} seed={2} />
      </View>
    ),
  },
  {
    title: '영어 단어를\n맞혀보세요 ✏️',
    description: '글자를 입력하면 색이 바뀌어요',
    content: (
      <View style={styles.tileContent}>
        <View style={styles.tileRow}>
          <TileExample letter="A" color={COLORS.correct} borderColor={COLORS.correctBorder} />
          <TileExample letter="P" color={COLORS.present} borderColor={COLORS.presentBorder} />
          <TileExample letter="P" color={COLORS.absent} borderColor={COLORS.absentBorder} />
          <TileExample letter="L" color={COLORS.correct} borderColor={COLORS.correctBorder} />
          <TileExample letter="E" color={COLORS.absent} borderColor={COLORS.absentBorder} />
        </View>
        <View style={styles.legendList}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.correct }]} />
            <Text style={styles.legendText}>🟩 맞는 자리에 있어요</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.present }]} />
            <Text style={styles.legendText}>🟨 다른 자리에 있어요</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.absent }]} />
            <Text style={styles.legendText}>⬜ 단어에 없어요</Text>
          </View>
        </View>
      </View>
    ),
  },
  {
    title: '힌트를 활용하세요 💡',
    description: '최대 4포인트까지 힌트를 쓸 수 있어요',
    content: (
      <View style={styles.hintContent}>
        <View style={styles.hintGrid}>
          <HintItem emoji="📖" label="예문 보기" />
          <HintItem emoji="🔤" label="첫 글자" />
          <HintItem emoji="🔢" label="모음 개수" />
          <HintItem emoji="🇰🇷" label="뜻 보기" />
          <HintItem emoji="📍" label="글자 위치" />
        </View>
        <View style={[styles.pointBadge, SKETCHY_RADIUS.small]}>
          <Text style={styles.pointText}>힌트 1개 = 1포인트 (📍는 2포인트)</Text>
        </View>
      </View>
    ),
  },
  {
    title: '준비됐나요? 🚀',
    description: '매일 새로운 단어를 배워봐요!\n복습, 연습, 통계도 있어요',
    content: (
      <View style={styles.readyContent}>
        <View style={styles.featureRow}>
          <DoodleDecoration type="star" size={32} color={CRAYON.green} seed={3} />
          <Text style={styles.featureText}>📚 복습 모드</Text>
        </View>
        <View style={styles.featureRow}>
          <DoodleDecoration type="star" size={32} color={CRAYON.blue} seed={4} />
          <Text style={styles.featureText}>🏋️ 연습 모드</Text>
        </View>
        <View style={styles.featureRow}>
          <DoodleDecoration type="star" size={32} color={CRAYON.orange} seed={5} />
          <Text style={styles.featureText}>📊 학습 통계</Text>
        </View>
        <View style={styles.featureRow}>
          <DoodleDecoration type="star" size={32} color={CRAYON.purple} seed={6} />
          <Text style={styles.featureText}>🏆 업적 배지</Text>
        </View>
      </View>
    ),
  },
];

// ── Screen component ──

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / SCREEN_WIDTH);
      setCurrentPage(page);
    },
    [],
  );

  const goToNext = useCallback(() => {
    if (currentPage < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (currentPage + 1), animated: true });
    }
  }, [currentPage]);

  const handleStart = useCallback(async () => {
    await completeOnboarding();
    router.replace('/');
  }, [completeOnboarding, router]);

  const isLastPage = currentPage === PAGES.length - 1;

  return (
    <PaperBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {PAGES.map((page, index) => (
            <View key={index} style={styles.page}>
              <View style={styles.pageContent}>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.description}>{page.description}</Text>
                {page.content}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {PAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentPage ? CRAYON.purple : CRAYON.pencilLine,
                    width: index === currentPage ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonRow}>
            <DoodleDecoration type="squiggle" size={28} seed={20} style={styles.squiggleLeft} />
            <SketchyButton
              label={isLastPage ? '시작하기!' : '다음'}
              onPress={isLastPage ? handleStart : goToNext}
              seed={200 + currentPage}
              variant="primary"
              wobble={isLastPage}
              style={styles.button}
            />
            <DoodleDecoration type="squiggle" size={28} seed={21} style={styles.squiggleRight} />
          </View>
        </View>
      </SafeAreaView>
    </PaperBackground>
  );
}
