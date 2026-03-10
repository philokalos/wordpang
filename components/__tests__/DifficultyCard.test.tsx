import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DifficultyCard from '../DifficultyCard';

describe('DifficultyCard', () => {
  it('should render difficulty label', () => {
    const { getByText } = render(
      <DifficultyCard difficulty="normal" isSelected={false} onPress={jest.fn()} />,
    );
    expect(getByText('Normal')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <DifficultyCard difficulty="easy" isSelected={false} onPress={onPress} />,
    );

    fireEvent.press(getByText('Easy'));
    expect(onPress).toHaveBeenCalled();
  });
});
