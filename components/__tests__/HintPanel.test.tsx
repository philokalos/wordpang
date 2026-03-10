import React from 'react';
import { render } from '@testing-library/react-native';
import HintPanel from '../HintPanel';

describe('HintPanel', () => {
  const defaultProps = {
    hints: [],
    hintPointsUsed: 0,
    gameStatus: 'playing' as const,
    onRequestHint: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render 3 hint buttons', () => {
    const { getByLabelText } = render(<HintPanel {...defaultProps} />);

    expect(getByLabelText('get example hint')).toBeTruthy();
    expect(getByLabelText('get firstLetter hint')).toBeTruthy();
    expect(getByLabelText('get vowelCount hint')).toBeTruthy();
  });

  it('should disable used hint buttons', () => {
    const props = {
      ...defaultProps,
      hints: [{ type: 'example' as const, content: '예문: test', cost: 1 }],
      hintPointsUsed: 1,
    };

    const { getByLabelText } = render(<HintPanel {...props} />);

    const exampleBtn = getByLabelText('get example hint');
    expect(exampleBtn.props.accessibilityState?.disabled).toBe(true);

    const firstLetterBtn = getByLabelText('get firstLetter hint');
    expect(firstLetterBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('should display hint cards', () => {
    const props = {
      ...defaultProps,
      hints: [
        { type: 'example' as const, content: '예문: I eat an _____ every day.', cost: 1 },
        { type: 'firstLetter' as const, content: '첫 글자: A', cost: 1 },
      ],
      hintPointsUsed: 2,
    };

    const { getByText } = render(<HintPanel {...props} />);

    expect(getByText('예문: I eat an _____ every day.')).toBeTruthy();
    expect(getByText('첫 글자: A')).toBeTruthy();
  });

  it('should show hint counter', () => {
    const { getByText } = render(<HintPanel {...defaultProps} />);
    expect(getByText('힌트 포인트 0/4')).toBeTruthy();
  });
});
