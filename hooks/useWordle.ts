import { useState, useCallback, useRef } from 'react';
import type { Difficulty, GameStatus, LetterStatus, Hint, HintType } from '../src/types/game';
import { DIFFICULTY_CONFIG } from '../src/types/game';
import type { WordEntry } from '../src/types/word';
import { getWordList, getRandomWord } from '../src/data';
import { evaluateGuess, isValidWord, updateKeyStatuses, generateHint } from '../src/lib/game-logic';
import { TOTAL_REVEAL_TIME } from '../constants/animations';

const MAX_HINTS = 3;

interface UseWordleReturn {
  difficulty: Difficulty;
  targetWord: WordEntry;
  guesses: string[];
  evaluations: LetterStatus[][];
  currentGuess: string;
  gameStatus: GameStatus;
  keyStatuses: Record<string, LetterStatus>;
  hints: Hint[];
  hintsUsed: number;
  isRevealing: boolean;
  isShaking: boolean;
  toastMessage: string;
  maxAttempts: number;
  wordLength: number;
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  submitGuess: () => void;
  requestHint: (type: HintType) => void;
  changeDifficulty: (difficulty: Difficulty) => void;
  newGame: () => void;
  startWithWord: (word: WordEntry) => void;
}

export function useWordle(initialDifficulty: Difficulty = 'normal'): UseWordleReturn {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [targetWord, setTargetWord] = useState<WordEntry>(() => getRandomWord(initialDifficulty));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<LetterStatus[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [keyStatuses, setKeyStatuses] = useState<Record<string, LetterStatus>>({});
  const [hints, setHints] = useState<Hint[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const revealTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const config = DIFFICULTY_CONFIG[difficulty];

  const addLetter = useCallback((letter: string) => {
    if (gameStatus !== 'playing' || isRevealing) return;
    setCurrentGuess((prev) => {
      if (prev.length >= config.wordLength) return prev;
      return prev + letter.toUpperCase();
    });
  }, [gameStatus, isRevealing, config.wordLength]);

  const removeLetter = useCallback(() => {
    if (gameStatus !== 'playing' || isRevealing) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameStatus, isRevealing]);

  const submitGuess = useCallback(() => {
    if (gameStatus !== 'playing' || isRevealing) return;
    if (currentGuess.length !== config.wordLength) return;

    const { validWords } = getWordList(difficulty);
    if (!isValidWord(currentGuess, validWords)) {
      setIsShaking(true);
      setToastMessage('단어 목록에 없어요!');
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => {
        setIsShaking(false);
        setToastMessage('');
      }, 1500);
      return;
    }

    const evaluation = evaluateGuess(currentGuess, targetWord.word);

    setKeyStatuses((prev) => {
      const currentMap = new Map(Object.entries(prev));
      const updatedMap = updateKeyStatuses(currentMap, currentGuess, evaluation);
      return Object.fromEntries(updatedMap);
    });

    setIsRevealing(true);
    setGuesses((prev) => [...prev, currentGuess]);
    setEvaluations((prev) => [...prev, evaluation]);
    setCurrentGuess('');

    const revealTime = TOTAL_REVEAL_TIME(config.wordLength);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(() => {
      setIsRevealing(false);
      if (currentGuess === targetWord.word) {
        setGameStatus('won');
      } else if (guesses.length + 1 >= config.maxAttempts) {
        setGameStatus('lost');
      }
    }, revealTime);
  }, [gameStatus, isRevealing, currentGuess, config, difficulty, targetWord, guesses.length]);

  const requestHint = useCallback((type: HintType) => {
    if (hintsUsed >= MAX_HINTS || gameStatus !== 'playing') return;
    const content = generateHint(targetWord, type);
    setHints((prev) => [...prev, { type, content }]);
    setHintsUsed((prev) => prev + 1);
  }, [hintsUsed, gameStatus, targetWord]);

  const resetGame = useCallback((diff: Difficulty, word?: WordEntry) => {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setTargetWord(word ?? getRandomWord(diff));
    setGuesses([]);
    setEvaluations([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setKeyStatuses({});
    setHints([]);
    setHintsUsed(0);
    setIsRevealing(false);
    setIsShaking(false);
    setToastMessage('');
  }, []);

  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    resetGame(newDifficulty);
  }, [resetGame]);

  const newGame = useCallback(() => {
    resetGame(difficulty);
  }, [resetGame, difficulty]);

  const startWithWord = useCallback((word: WordEntry) => {
    resetGame(difficulty, word);
  }, [resetGame, difficulty]);

  return {
    difficulty,
    targetWord,
    guesses,
    evaluations,
    currentGuess,
    gameStatus,
    keyStatuses,
    hints,
    hintsUsed,
    isRevealing,
    isShaking,
    toastMessage,
    maxAttempts: config.maxAttempts,
    wordLength: config.wordLength,
    addLetter,
    removeLetter,
    submitGuess,
    requestHint,
    changeDifficulty,
    newGame,
    startWithWord,
  };
}
