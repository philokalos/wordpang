import React from 'react';
import { render } from '@testing-library/react-native';
import LetterTile from '../LetterTile';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('LetterTile', () => {
  it('should render letter text', () => {
    const { getByText } = render(
      <LetterTile letter="A" wordLength={5} />,
    );
    expect(getByText('A')).toBeTruthy();
  });

  it('should have "empty" accessibility label when no letter', () => {
    const { getByLabelText } = render(
      <LetterTile letter="" wordLength={5} />,
    );
    expect(getByLabelText('empty')).toBeTruthy();
  });

  it('should include status in accessibility label', () => {
    const { getByLabelText } = render(
      <LetterTile letter="B" status="correct" wordLength={5} />,
    );
    expect(getByLabelText('B, correct')).toBeTruthy();
  });
});
