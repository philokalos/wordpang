import { renderHook, act } from '@testing-library/react-native';
import { useWordle } from '../useWordle';

// Mock animations constant
jest.mock('../../constants/animations', () => ({
  FLIP_DURATION: 0,
  FLIP_STAGGER: 0,
  POP_DURATION: 0,
  SHAKE_DURATION: 0,
  BOUNCE_DURATION: 0,
  BOUNCE_STAGGER: 0,
  REVEAL_DELAY: () => 0,
  TOTAL_REVEAL_TIME: () => 0,
  EASING: {
    flip: { factory: () => 0 },
    pop: { factory: () => 0 },
    shake: { factory: () => 0 },
    bounce: { factory: () => 0 },
  },
}));

describe('useWordle', () => {
  it('should have correct initial state', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    expect(result.current.gameStatus).toBe('playing');
    expect(result.current.guesses).toEqual([]);
    expect(result.current.hints).toEqual([]);
    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.currentGuess).toBe('');
    expect(result.current.isRevealing).toBe(false);
    expect(result.current.isShaking).toBe(false);
    expect(result.current.wordLength).toBe(5);
    expect(result.current.maxAttempts).toBe(6);
  });

  it('should add a letter', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      result.current.addLetter('A');
    });

    expect(result.current.currentGuess).toBe('A');
  });

  it('should not exceed wordLength', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'easy' })); // 4 letters

    act(() => {
      result.current.addLetter('A');
      result.current.addLetter('B');
      result.current.addLetter('C');
      result.current.addLetter('D');
      result.current.addLetter('E'); // should be ignored
    });

    expect(result.current.currentGuess).toBe('ABCD');
  });

  it('should remove last letter', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      result.current.addLetter('A');
      result.current.addLetter('B');
    });
    act(() => {
      result.current.removeLetter();
    });

    expect(result.current.currentGuess).toBe('A');
  });

  it('should set isShaking and toastMessage for invalid word', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      // Type a 5-letter word that is not in the word list
      'ZZZZZ'.split('').forEach((l) => result.current.addLetter(l));
    });
    act(() => {
      result.current.submitGuess();
    });

    expect(result.current.isShaking).toBe(true);
    expect(result.current.toastMessage).toBe('단어 목록에 없어요!');
  });

  it('should submit a valid guess and add to evaluations', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    // Use startWithWord to control the target
    const targetWord = result.current.targetWord;

    act(() => {
      targetWord.word.split('').forEach((l) => result.current.addLetter(l));
    });
    act(() => {
      result.current.submitGuess();
    });

    expect(result.current.guesses).toHaveLength(1);
    expect(result.current.evaluations).toHaveLength(1);
    expect(result.current.currentGuess).toBe('');
  });

  it('should detect win when guess matches target', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    const target = result.current.targetWord.word;

    act(() => {
      target.split('').forEach((l) => result.current.addLetter(l));
    });
    act(() => {
      result.current.submitGuess();
    });
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.gameStatus).toBe('won');
    jest.useRealTimers();
  });

  it('should add hint and increment hintsUsed', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      result.current.requestHint('example');
    });

    expect(result.current.hints).toHaveLength(1);
    expect(result.current.hintsUsed).toBe(1);
    expect(result.current.hints[0]!.type).toBe('example');
  });

  it('should not exceed MAX_HINTS (3)', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      result.current.requestHint('example');
      result.current.requestHint('firstLetter');
      result.current.requestHint('vowelCount');
    });

    expect(result.current.hintsUsed).toBe(3);

    // Try a 4th — should be ignored (duplicate type, but even if not, max reached)
    act(() => {
      result.current.requestHint('example');
    });

    expect(result.current.hintsUsed).toBe(3);
  });

  it('should reset on changeDifficulty', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      result.current.addLetter('A');
      result.current.requestHint('example');
    });

    act(() => {
      result.current.changeDifficulty('easy');
    });

    expect(result.current.difficulty).toBe('easy');
    expect(result.current.wordLength).toBe(4);
    expect(result.current.currentGuess).toBe('');
    expect(result.current.hints).toEqual([]);
    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.gameStatus).toBe('playing');
  });

  it('should reset on newGame', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    act(() => {
      result.current.addLetter('X');
    });
    act(() => {
      result.current.newGame();
    });

    expect(result.current.currentGuess).toBe('');
    expect(result.current.guesses).toEqual([]);
    expect(result.current.gameStatus).toBe('playing');
  });

  it('should start with specified word via startWithWord', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    const customWord = {
      word: 'TESTS',
      meaning: '테스트',
      pronunciation: '테스츠',
      example: 'We run tests.',
      category: 'school' as const,
      partOfSpeech: 'noun',
    };

    act(() => {
      result.current.startWithWord(customWord);
    });

    expect(result.current.targetWord).toEqual(customWord);
    expect(result.current.gameStatus).toBe('playing');
  });

  it('should use Record type for keyStatuses', () => {
    const { result } = renderHook(() => useWordle({ difficulty: 'normal' }));

    // keyStatuses should be a plain object, not a Map
    expect(result.current.keyStatuses).toEqual({});
    expect(result.current.keyStatuses instanceof Map).toBe(false);
  });

  it('should detect loss when maxAttempts exhausted', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useWordle({ difficulty: 'easy' })); // 4 letters, 6 attempts

    // Set a known target
    const knownTarget = {
      word: 'BEAR',
      meaning: '곰',
      pronunciation: '베어',
      example: 'The bear is sleeping in the cave.',
      category: 'animal' as const,
      partOfSpeech: 'noun',
    };
    act(() => {
      result.current.startWithWord(knownTarget);
    });

    // Submit 6 wrong-but-valid guesses (not BEAR)
    const wrongWords = ['BAKE', 'BARN', 'BEAN', 'BELL', 'BIRD', 'BLOW'];
    for (const word of wrongWords) {
      act(() => {
        word.split('').forEach((l) => result.current.addLetter(l));
      });
      act(() => {
        result.current.submitGuess();
      });
      act(() => {
        jest.runAllTimers();
      });
    }

    expect(result.current.gameStatus).toBe('lost');
    expect(result.current.guesses).toHaveLength(6);
    jest.useRealTimers();
  });
});
