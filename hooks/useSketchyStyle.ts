import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { seededRandom } from '../utils/sketchy';
import { SKETCHY_RADIUS } from '../constants/theme';

type RadiusSize = keyof typeof SKETCHY_RADIUS;

interface SketchyStyleOptions {
  seed: number;
  radiusSize?: RadiusSize;
  rotation?: boolean;
  maxRotation?: number;
}

/**
 * Returns stable random sketchy style properties (irregular border radius, micro-rotation).
 * Uses useMemo so styles are computed once per seed.
 */
export function useSketchyStyle({
  seed,
  radiusSize = 'medium',
  rotation = false,
  maxRotation = 1.5,
}: SketchyStyleOptions): ViewStyle {
  return useMemo(() => {
    const rand = seededRandom(seed);
    const base = SKETCHY_RADIUS[radiusSize];

    // Add slight variation to each corner
    const vary = (val: number) => val + Math.round((rand() - 0.5) * 4);

    const style: ViewStyle = {
      borderTopLeftRadius: vary(base.borderTopLeftRadius),
      borderTopRightRadius: vary(base.borderTopRightRadius),
      borderBottomLeftRadius: vary(base.borderBottomLeftRadius),
      borderBottomRightRadius: vary(base.borderBottomRightRadius),
    };

    if (rotation) {
      const deg = (rand() - 0.5) * 2 * maxRotation;
      style.transform = [{ rotate: `${deg.toFixed(2)}deg` }];
    }

    return style;
  }, [seed, radiusSize, rotation, maxRotation]);
}
