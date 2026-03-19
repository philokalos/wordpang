/**
 * useOnboarding Hook Tests (DDD Domain Service)
 *
 * Tests for onboarding state management:
 * - Loading state behavior
 * - Persisted onboarding completion
 * - completeOnboarding side effects
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from '../useOnboarding';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;

describe('useOnboarding', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should initially have isLoading as true', () => {
    mockGetItem.mockReturnValue(new Promise(() => {/* never resolves */}));

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isLoading).toBe(true);
  });

  it('should reflect stored value after load (isOnboardingDone = true)', async () => {
    mockGetItem.mockResolvedValue('true');

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingDone).toBe(true);
  });

  it('should set isOnboardingDone to false when no stored value exists', async () => {
    mockGetItem.mockResolvedValue(null);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingDone).toBe(false);
  });

  it('should call AsyncStorage.setItem when completeOnboarding is called', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(mockSetItem).toHaveBeenCalledWith('wordpang_onboarding_done', 'true');
  });

  it('should set isOnboardingDone to true after completeOnboarding', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingDone).toBe(false);

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.isOnboardingDone).toBe(true);
  });
});
