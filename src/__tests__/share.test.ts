import { buildEmojiGrid } from '../../services/share';
import type { LetterStatus } from '../types/game';

describe('buildEmojiGrid', () => {
  it('should convert statuses to emoji', () => {
    const evaluations: LetterStatus[][] = [
      ['correct', 'present', 'absent', 'absent', 'absent'],
    ];
    expect(buildEmojiGrid(evaluations)).toBe('🟩🟧⬜⬜⬜');
  });

  it('should join multiple rows with newlines', () => {
    const evaluations: LetterStatus[][] = [
      ['absent', 'absent', 'present', 'absent', 'absent'],
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    expect(buildEmojiGrid(evaluations)).toBe('⬜⬜🟧⬜⬜\n🟩🟩🟩🟩🟩');
  });
});
