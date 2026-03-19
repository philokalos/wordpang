import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { SKETCHY_FONTS, SKETCHY_RADIUS } from '../constants/theme';
import { useReview } from '../hooks/useReview';
import { useSound } from '../hooks/useSound';
import { getWordList } from '../src/data';
import type { WordEntry } from '../src/types/word';
import PaperBackground from '../components/sketchy/PaperBackground';
import DoodleDecoration from '../components/sketchy/DoodleDecoration';
import FlashCard from '../components/FlashCard';
import ReviewList from '../components/ReviewList';

type Tab = 'collection' | 'quiz';

export default function ReviewScreen() {
  const router = useRouter();
  const { entries, dueWords, dueCount, markReviewed, refresh } = useReview();
  const { play } = useSound();
  const [tab, setTab] = useState<Tab>('collection');
  const [quizIndex, setQuizIndex] = useState(0);

  const findWordEntry = (word: string): WordEntry | undefined => {
    for (const diff of ['easy', 'normal', 'hard'] as const) {
      const { answers } = getWordList(diff);
      const found = answers.find((a) => a.word === word);
      if (found) return found;
    }
    return undefined;
  };

  const currentDueWord = dueWords[quizIndex];
  const currentWordEntry = currentDueWord ? findWordEntry(currentDueWord.word) : undefined;

  const handleKnew = async () => {
    play('pop');
    if (currentDueWord) {
      await markReviewed(currentDueWord.word);
    }
    if (quizIndex + 1 < dueWords.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
      await refresh();
    }
  };

  const handleForgot = () => {
    play('shake');
    if (quizIndex + 1 < dueWords.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizIndex(0);
    }
  };

  const handleFlip = () => {
    play('flip');
  };

  return (
    <PaperBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
          </Pressable>
          <Text style={styles.title}>복습</Text>
          <View style={styles.spacer} />
        </View>

        <View style={[styles.tabs, SKETCHY_RADIUS.medium]}>
          <Pressable
            onPress={() => setTab('collection')}
            style={[styles.tab, SKETCHY_RADIUS.small, tab === 'collection' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'collection' && styles.tabTextActive]}>
              컬렉션 ({entries.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('quiz')}
            style={[styles.tab, SKETCHY_RADIUS.small, tab === 'quiz' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'quiz' && styles.tabTextActive]}>
              퀴즈 ({dueCount})
            </Text>
          </Pressable>
        </View>

        {tab === 'collection' ? (
          <ReviewList entries={entries} />
        ) : (
          <View style={styles.quizArea}>
            {currentWordEntry ? (
              <>
                <Text style={styles.quizProgress}>
                  {quizIndex + 1} / {dueWords.length}
                </Text>
                <FlashCard
                  key={currentDueWord?.word}
                  word={currentWordEntry}
                  onKnew={handleKnew}
                  onForgot={handleForgot}
                  onFlip={handleFlip}
                />
              </>
            ) : (
              <View style={styles.emptyQuiz}>
                <View style={styles.emptyDoodleRow}>
                  <DoodleDecoration type="star" size={18} seed={50} />
                  <Text style={styles.emptyEmoji}>🎉</Text>
                  <DoodleDecoration type="star" size={18} seed={51} />
                </View>
                <Text style={styles.emptyText}>복습할 단어가 없어요!</Text>
                <Text style={styles.emptySubtext}>나중에 다시 확인해 보세요</Text>
                <DoodleDecoration type="squiggle" size={48} seed={52} style={styles.emptySquiggle} />
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.purpleText,
  },
  title: {
    fontSize: 22,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textPrimary,
  },
  spacer: {
    width: 60,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.tileBorder,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.purpleBg,
  },
  tabText: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.purpleText,
    fontFamily: SKETCHY_FONTS.bold,
  },
  quizArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  quizProgress: {
    fontSize: 15,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  emptyQuiz: {
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: SKETCHY_FONTS.bold,
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: SKETCHY_FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyDoodleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emptySquiggle: {
    marginTop: 16,
    opacity: 0.5,
  },
});
