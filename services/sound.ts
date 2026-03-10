import { Audio } from 'expo-av';

type SoundName = 'pop' | 'flip' | 'win' | 'lose' | 'shake';

const SOUND_FILES: Record<SoundName, number> = {
  pop: require('../assets/sounds/pop.mp3'),
  flip: require('../assets/sounds/flip.mp3'),
  win: require('../assets/sounds/win.mp3'),
  lose: require('../assets/sounds/lose.mp3'),
  shake: require('../assets/sounds/shake.mp3'),
};

const loadedSounds: Partial<Record<SoundName, Audio.Sound>> = {};

export async function loadSounds(): Promise<void> {
  for (const [name, file] of Object.entries(SOUND_FILES)) {
    try {
      const { sound } = await Audio.Sound.createAsync(file);
      loadedSounds[name as SoundName] = sound;
    } catch {
      // Sound loading is optional — haptics will be primary feedback
    }
  }
}

export async function playSound(name: SoundName): Promise<void> {
  const sound = loadedSounds[name];
  if (!sound) return;

  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Silently fail — sounds are supplementary
  }
}

export async function unloadSounds(): Promise<void> {
  for (const sound of Object.values(loadedSounds)) {
    if (sound) {
      await sound.unloadAsync();
    }
  }
}
