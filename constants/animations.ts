import { Easing } from 'react-native-reanimated';

export const FLIP_DURATION = 300;
export const FLIP_STAGGER = 300;
export const POP_DURATION = 100;
export const SHAKE_DURATION = 500;
export const BOUNCE_DURATION = 600;
export const BOUNCE_STAGGER = 100;

export const REVEAL_DELAY = (index: number): number => index * FLIP_STAGGER;
export const TOTAL_REVEAL_TIME = (wordLength: number): number =>
  wordLength * FLIP_STAGGER + FLIP_DURATION;

export const WOBBLE_ROTATION = 1.5;
export const WOBBLE_DURATION = 2000;

export const EASING = {
  flip: Easing.inOut(Easing.ease),
  pop: Easing.out(Easing.back(1.5)),
  shake: Easing.linear,
  bounce: Easing.out(Easing.back(1.2)),
  wobble: Easing.inOut(Easing.ease),
} as const;
