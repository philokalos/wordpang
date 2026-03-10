import { Share } from 'react-native';
import type { LetterStatus } from '../src/types/game';

const STATUS_EMOJI: Record<LetterStatus, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬜',
};

export function buildEmojiGrid(evaluations: LetterStatus[][]): string {
  return evaluations
    .map((row) => row.map((status) => STATUS_EMOJI[status]).join(''))
    .join('\n');
}

export async function shareResult(
  won: boolean,
  attempts: number,
  maxAttempts: number,
  evaluations: LetterStatus[][],
  isDaily: boolean,
): Promise<void> {
  const header = isDaily ? '🌸 WordPop Daily' : '🌸 WordPop';
  const score = won ? `${attempts}/${maxAttempts}` : `X/${maxAttempts}`;
  const grid = buildEmojiGrid(evaluations);

  const message = `${header} ${score}\n\n${grid}`;

  await Share.share({ message });
}
