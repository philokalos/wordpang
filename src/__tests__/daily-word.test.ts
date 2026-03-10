import { getDailyWord, getTodayString, getTimeUntilMidnight } from '../../services/daily-word';

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

describe('getTodayString', () => {
  it('should return date in YYYY-MM-DD format', () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Should match current date
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(today).toBe(expected);
  });
});

describe('getTimeUntilMidnight', () => {
  it('should return hours, minutes, seconds', () => {
    const time = getTimeUntilMidnight();
    expect(time).toHaveProperty('hours');
    expect(time).toHaveProperty('minutes');
    expect(time).toHaveProperty('seconds');
    expect(typeof time.hours).toBe('number');
    expect(typeof time.minutes).toBe('number');
    expect(typeof time.seconds).toBe('number');
  });

  it('should return non-negative values', () => {
    const time = getTimeUntilMidnight();
    expect(time.hours).toBeGreaterThanOrEqual(0);
    expect(time.hours).toBeLessThanOrEqual(23);
    expect(time.minutes).toBeGreaterThanOrEqual(0);
    expect(time.minutes).toBeLessThanOrEqual(59);
    expect(time.seconds).toBeGreaterThanOrEqual(0);
    expect(time.seconds).toBeLessThanOrEqual(59);
  });
});
