import React from 'react';
import { render } from '@testing-library/react-native';
import StatsDisplay from '../StatsDisplay';

describe('StatsDisplay', () => {
  const stats = {
    totalPlayed: 20,
    totalWon: 15,
    currentStreak: 5,
    maxStreak: 8,
    guessDistribution: { 1: 1, 2: 3, 3: 5, 4: 4, 5: 2 },
    difficultyStats: {
      easy: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      normal: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
      hard: { gamesPlayed: 0, gamesWon: 0, totalGuesses: 0 },
    },
  };

  it('should render stat values', () => {
    const { getByText, getAllByText } = render(<StatsDisplay stats={stats} winRate={75} />);

    expect(getByText('20')).toBeTruthy();
    expect(getByText('75%')).toBeTruthy();
    // "5" appears in both currentStreak stat and distribution — use getAllByText
    expect(getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(getByText('8')).toBeTruthy();
  });

  it('should render 7 distribution rows', () => {
    const { getByText } = render(<StatsDisplay stats={stats} winRate={75} />);

    expect(getByText('추측 분포')).toBeTruthy();
    // Row labels 6 and 7 are unique (not in guessDistribution values)
    expect(getByText('6')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
  });
});
