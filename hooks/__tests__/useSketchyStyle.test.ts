import { renderHook } from '@testing-library/react-native';
import { useSketchyStyle } from '../useSketchyStyle';

describe('useSketchyStyle', () => {
  it('should return deterministic style for the same seed', () => {
    const { result: r1 } = renderHook(() => useSketchyStyle({ seed: 42 }));
    const { result: r2 } = renderHook(() => useSketchyStyle({ seed: 42 }));
    expect(r1.current).toEqual(r2.current);
  });

  it('should return different styles for different seeds', () => {
    const { result: r1 } = renderHook(() => useSketchyStyle({ seed: 1 }));
    const { result: r2 } = renderHook(() => useSketchyStyle({ seed: 9999 }));
    expect(r1.current).not.toEqual(r2.current);
  });

  it('should not include transform when rotation is false (default)', () => {
    const { result } = renderHook(() => useSketchyStyle({ seed: 10, rotation: false }));
    expect(result.current.transform).toBeUndefined();
  });

  it('should include transform with rotate when rotation is true', () => {
    const { result } = renderHook(() => useSketchyStyle({ seed: 10, rotation: true }));
    expect(result.current.transform).toBeDefined();
    const transform = result.current.transform as Array<{ rotate: string }>;
    expect(transform[0]).toHaveProperty('rotate');
    expect(transform[0].rotate).toMatch(/^-?\d+\.\d+deg$/);
  });

  it('should respect maxRotation by producing rotation within range', () => {
    // Run many seeds and check all are within range
    const maxRotation = 3;
    for (let seed = 0; seed < 50; seed++) {
      const { result } = renderHook(() =>
        useSketchyStyle({ seed, rotation: true, maxRotation }),
      );
      const transform = result.current.transform as Array<{ rotate: string }>;
      const deg = parseFloat(transform[0].rotate);
      expect(Math.abs(deg)).toBeLessThanOrEqual(maxRotation);
    }
  });

  it('should return valid border radii for small radiusSize', () => {
    const { result } = renderHook(() => useSketchyStyle({ seed: 5, radiusSize: 'small' }));
    // base small = 5-10, variation ±2 → values should be positive
    expect(result.current.borderTopLeftRadius).toBeGreaterThan(0);
    expect(result.current.borderTopRightRadius).toBeGreaterThan(0);
    expect(result.current.borderBottomLeftRadius).toBeGreaterThan(0);
    expect(result.current.borderBottomRightRadius).toBeGreaterThan(0);
  });

  it('should return valid border radii for large radiusSize', () => {
    const { result } = renderHook(() => useSketchyStyle({ seed: 5, radiusSize: 'large' }));
    expect(result.current.borderTopLeftRadius).toBeGreaterThan(0);
    expect(result.current.borderTopRightRadius).toBeGreaterThan(0);
  });
});
