import React from 'react';
import { Share } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ShareButton from '../ShareButton';

jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

describe('ShareButton', () => {
  it('should call Share.share on press', () => {
    const { getByText } = render(
      <ShareButton
        won={true}
        attempts={3}
        maxAttempts={6}
        evaluations={[
          ['correct', 'correct', 'correct', 'correct', 'correct'],
        ]}
        isDaily={false}
      />,
    );

    fireEvent.press(getByText('📤 결과 공유'));
    expect(Share.share).toHaveBeenCalled();
  });
});
