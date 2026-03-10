import { getDailyWord } from '../../services/daily-word';

describe('getDailyWord', () => {
  it('should return deterministic word for same date', () => {
    const word1 = getDailyWord('normal');
    const word2 = getDailyWord('normal');
    expect(word1.word).toBe(word2.word);
  });

  it('should return different words for different difficulties', () => {
    const easy = getDailyWord('easy');
    const hard = getDailyWord('hard');
    // Different pools, very likely different words
    expect(easy.word.length).toBe(4);
    expect(hard.word.length).toBe(6);
  });

  it('should return a valid WordEntry', () => {
    const word = getDailyWord('normal');
    expect(word).toHaveProperty('word');
    expect(word).toHaveProperty('meaning');
    expect(word).toHaveProperty('pronunciation');
    expect(word).toHaveProperty('example');
    expect(word.word.length).toBe(5);
  });
});
