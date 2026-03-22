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
 * Find a word that rhymes with the target (shares last 2+ letters).
 * Searches validWords set, excluding the target itself.
 */
export function findRhymingWord(word: string, validWords?: Set<string>): string | null {
  if (!validWords) return null;

  const suffix2 = word.slice(-2);
  const suffix3 = word.length >= 3 ? word.slice(-3) : null;
  let bestMatch: string | null = null;

  for (const candidate of validWords) {
    if (candidate === word) continue;
    if (candidate.length !== word.length) continue;

    // Prefer 3-letter suffix match
    if (suffix3 && candidate.endsWith(suffix3)) {
      return candidate;
    }
    // Fall back to 2-letter suffix match
    if (!bestMatch && candidate.endsWith(suffix2)) {
      bestMatch = candidate;
    }
  }

  return bestMatch;
}

/**
 * Generate a word family pattern like "_A_E" revealing some letters.
 * Reveals vowels and keeps consonants hidden.
 */
export function generateWordFamilyPattern(word: string): string {
  const vowels = 'AEIOU';
  return word
    .split('')
    .map((c) => (vowels.includes(c) ? c : '_'))
    .join('');
}

/**
 * Generate a hint for the current word.
 */
export function generateHint(
  wordEntry: WordEntry,
  type: HintType,
  guesses?: string[],
  validWords?: Set<string>,
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
    case 'meaning':
      return `뜻: ${wordEntry.meaning}`;
    case 'letterPosition': {
      // Find a letter position not yet revealed by guesses
      const word = wordEntry.word;
      const revealedPositions = new Set<number>();

      if (guesses) {
        for (const guess of guesses) {
          for (let i = 0; i < guess.length; i++) {
            if (guess[i] === word[i]) {
              revealedPositions.add(i);
            }
          }
        }
      }

      const unrevealed = [];
      for (let i = 0; i < word.length; i++) {
        if (!revealedPositions.has(i)) {
          unrevealed.push(i);
        }
      }

      if (unrevealed.length === 0) {
        return `모든 위치가 이미 밝혀졌어요!`;
      }

      const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)]!;
      return `${pos + 1}번째 글자: ${word[pos]}`;
    }

    case 'rhyming': {
      const rhyme = findRhymingWord(wordEntry.word, validWords);
      if (rhyme) {
        return `라이밍: ${rhyme} 와 비슷한 끝소리`;
      }
      return `라이밍: ...${wordEntry.word.slice(-2)} 로 끝나요`;
    }
    case 'wordFamily': {
      const pattern = generateWordFamilyPattern(wordEntry.word);
      return `단어 패턴: ${pattern}`;
    }
  }
}
