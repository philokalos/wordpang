import { useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { loadSounds, playSound as playSoundService, unloadSounds } from '../services/sound';

type SoundEvent = 'pop' | 'flip' | 'win' | 'lose' | 'shake';

export function useSound() {
  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const play = useCallback(async (event: SoundEvent) => {
    switch (event) {
      case 'pop':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'flip':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'win':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'lose':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'shake':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
    await playSoundService(event);
  }, []);

  return { play };
}
