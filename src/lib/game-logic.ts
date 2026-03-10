import type { LetterStatus, HintType } from '../types/game';
import type { WordEntry } from '../types/word';

/**
 * Evaluate a guess against the target word.
 * 2-pass algorithm: exact matches first, then present check with duplicate handling.
 */
export function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const result: LetterStatus[] = new Array(guess.length).fill('absent') as LetterStatus[];
  const targetLetters = target.split('');
  const remaining: (string | null)[] = [...targetLetters];

  // Pass 1: exact matches
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i] = 'correct';
      remaining[i] = null;
    }
  }

  // Pass 2: present (wrong position) — respects remaining count
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const letter = guess[i]!;
    const remainingIndex = remaining.indexOf(letter);
    if (remainingIndex !== -1) {
      result[i] = 'present';
      remaining[remainingIndex] = null;
    }
  }

  return result;
}

/**
 * Check if a word is in the valid words set.
 */
export function isValidWord(word: string, validWords: Set<string>): boolean {
  return validWords.has(word.toUpperCase());
}

/**
 * Update keyboard key statuses with priority: correct > present > absent.
 */
export function updateKeyStatuses(
  current: Map<string, LetterStatus>,
  guess: string,
  evaluation: LetterStatus[],
): Map<string, LetterStatus> {
  const updated = new Map(current);
  const priority: Record<LetterStatus, number> = {
    correct: 3,
    present: 2,
    absent: 1,
  };

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i]!;
    const newStatus = evaluation[i]!;
    const existingStatus = updated.get(letter);

    if (!existingStatus || priority[newStatus] > priority[existingStatus]) {
      updated.set(letter, newStatus);
    }
  }

  return updated;
}

/**
 * Generate a hint for the current word.
 */
export function generateHint(
  wordEntry: WordEntry,
  type: HintType,
): string {
  switch (type) {
    case 'example': {
      const blank = '_'.repeat(wordEntry.word.length);
      const pattern = new RegExp(wordEntry.word, 'gi');
      return `예문: ${wordEntry.example.replace(pattern, blank)}`;
    }
    case 'firstLetter':
      return `첫 글자: ${wordEntry.word[0]}`;
    case 'vowelCount': {
      const vowels = wordEntry.word.split('').filter((c) => 'AEIOU'.includes(c)).length;
      return `모음 수: ${vowels}개`;
    }
  }
}
