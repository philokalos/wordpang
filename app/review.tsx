import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useReview } from '../hooks/useReview';
import { useSound } from '../hooks/useSound';
import { getWordList } from '../src/data';
import type { WordEntry } from '../src/types/word';
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>복습</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('collection')}
          style={[styles.tab, tab === 'collection' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'collection' && styles.tabTextActive]}>
            컬렉션 ({entries.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('quiz')}
          style={[styles.tab, tab === 'quiz' && styles.tabActive]}
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
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>복습할 단어가 없어요!</Text>
              <Text style={styles.emptySubtext}>나중에 다시 확인해 보세요</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.purpleText,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  spacer: {
    width: 60,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.purpleBg,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.purpleText,
  },
  quizArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  quizProgress: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
