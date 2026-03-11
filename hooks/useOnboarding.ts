import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'wordpop_onboarding_done';

interface UseOnboardingResult {
  isLoading: boolean;
  isOnboardingDone: boolean;
  completeOnboarding: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        setIsOnboardingDone(value === 'true');
      })
      .catch(() => {
        // If read fails, treat as not done
        setIsOnboardingDone(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOnboardingDone(true);
  }, []);

  return { isLoading, isOnboardingDone, completeOnboarding };
}
