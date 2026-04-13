export type Difficulty = 'easy' | 'normal' | 'hard';

export type LetterStatus = 'correct' | 'present' | 'absent';

export type GameStatus = 'playing' | 'won' | 'lost';

export type HintType = 'example' | 'firstLetter' | 'vowelCount' | 'meaning' | 'pronunciation' | 'letterPosition' | 'rhyming' | 'wordFamily';

export interface Hint {
  type: HintType;
  content: string;
  cost: number;
}

export interface GameState {
  difficulty: Difficulty;
  targetWord: string;
  guesses: string[];
  evaluations: LetterStatus[][];
  currentGuess: string;
  gameStatus: GameStatus;
  keyStatuses: Map<string, LetterStatus>;
  hints: Hint[];
  hintsUsed: number;
  isRevealing: boolean;
  isShaking: boolean;
}

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { wordLength: number; maxAttempts: number; label: string; emoji: string }
> = {
  easy: { wordLength: 4, maxAttempts: 6, label: 'Easy', emoji: '🌟' },
  normal: { wordLength: 5, maxAttempts: 6, label: 'Normal', emoji: '⭐' },
  hard: { wordLength: 6, maxAttempts: 7, label: 'Hard', emoji: '💪' },
};

export const HINT_COSTS: Record<HintType, number> = {
  example: 1,
  firstLetter: 1,
  vowelCount: 1,
  meaning: 1,
  pronunciation: 1,
  letterPosition: 2,
  rhyming: 1,
  wordFamily: 2,
};

export const MAX_HINT_POINTS = 4;
