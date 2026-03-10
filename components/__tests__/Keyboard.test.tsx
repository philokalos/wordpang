import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Keyboard from '../Keyboard';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

describe('Keyboard', () => {
  const defaultProps = {
    keyStatuses: {},
    onLetter: jest.fn(),
    onEnter: jest.fn(),
    onBackspace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all 26 letter keys plus ENTER and BACK', () => {
    const { getByLabelText } = render(<Keyboard {...defaultProps} />);

    // Check a few letters
    expect(getByLabelText('q')).toBeTruthy();
    expect(getByLabelText('z')).toBeTruthy();
    expect(getByLabelText('backspace')).toBeTruthy();

    // ENTER key has lowercase label
    expect(getByLabelText('enter')).toBeTruthy();
  });

  it('should call onLetter when a letter key is pressed', () => {
    const { getByLabelText } = render(<Keyboard {...defaultProps} />);

    fireEvent.press(getByLabelText('a'));
    expect(defaultProps.onLetter).toHaveBeenCalledWith('A');
  });

  it('should call onEnter when ENTER is pressed', () => {
    const { getByLabelText } = render(<Keyboard {...defaultProps} />);

    fireEvent.press(getByLabelText('enter'));
    expect(defaultProps.onEnter).toHaveBeenCalled();
  });

  it('should call onBackspace when BACK is pressed', () => {
    const { getByLabelText } = render(<Keyboard {...defaultProps} />);

    fireEvent.press(getByLabelText('backspace'));
    expect(defaultProps.onBackspace).toHaveBeenCalled();
  });
});
