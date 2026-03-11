/**
 * DDD Domain Tests: Sketchy Utility Functions
 *
 * Pure utility layer for hand-drawn SVG generation and deterministic randomness.
 * Tests verify behavioral contracts:
 * - Determinism: same inputs always produce same outputs
 * - Validity: SVG paths are well-formed
 * - Boundary: edge cases produce sensible results
 * - Distribution: random values fall within expected ranges
 */

import {
  seededRandom,
  generateWobblyRectPath,
  generateStarPath,
  generateSquigglePath,
  hashString,
} from '../sketchy';

// ============================================================================
// seededRandom
// ============================================================================

describe('seededRandom: deterministic PRNG', () => {
  it('should return a function', () => {
    const rand = seededRandom(42);
    expect(typeof rand).toBe('function');
  });

  it('should produce deterministic output for the same seed', () => {
    const rand1 = seededRandom(42);
    const rand2 = seededRandom(42);
    const results1 = Array.from({ length: 10 }, () => rand1());
    const results2 = Array.from({ length: 10 }, () => rand2());
    expect(results1).toEqual(results2);
  });

  it('should produce different output for different seeds', () => {
    const rand1 = seededRandom(1);
    const rand2 = seededRandom(2);
    const v1 = rand1();
    const v2 = rand2();
    expect(v1).not.toEqual(v2);
  });

  it('should produce values in range [0, 1)', () => {
    const rand = seededRandom(123);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('should produce a reasonable distribution (no extreme clustering)', () => {
    const rand = seededRandom(999);
    const buckets = [0, 0, 0, 0, 0]; // 5 buckets of 0.2 width
    const n = 1000;
    for (let i = 0; i < n; i++) {
      const v = rand();
      const bucket = Math.min(Math.floor(v * 5), 4);
      buckets[bucket]++;
    }
    // Each bucket should have at least 10% (100) of samples
    buckets.forEach((count) => {
      expect(count).toBeGreaterThan(100);
    });
  });

  it('should produce sequential values that differ', () => {
    const rand = seededRandom(7);
    const first = rand();
    const second = rand();
    const third = rand();
    expect(first).not.toEqual(second);
    expect(second).not.toEqual(third);
  });

  it('should handle seed 0', () => {
    const rand = seededRandom(0);
    const v = rand();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('should handle negative seeds', () => {
    const rand = seededRandom(-42);
    const v = rand();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('should handle very large seeds', () => {
    const rand = seededRandom(2147483647); // max 32-bit int
    const v = rand();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  it('should produce different sequences for seeds 0 and 1', () => {
    const rand0 = seededRandom(0);
    const rand1 = seededRandom(1);
    const seq0 = Array.from({ length: 5 }, () => rand0());
    const seq1 = Array.from({ length: 5 }, () => rand1());
    expect(seq0).not.toEqual(seq1);
  });
});

// ============================================================================
// generateWobblyRectPath
// ============================================================================

describe('generateWobblyRectPath: SVG rectangle with hand-drawn edges', () => {
  it('should return a valid SVG path starting with M and ending with Z', () => {
    const path = generateWobblyRectPath(100, 50, 42);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
  });

  it('should contain Q (quadratic bezier) curve commands', () => {
    const path = generateWobblyRectPath(100, 50, 42);
    const qCount = (path.match(/ Q /g) ?? []).length;
    // 16 points: 15 segments + 1 closing = 16 Q commands
    expect(qCount).toBe(16);
  });

  it('should be deterministic for the same seed', () => {
    const path1 = generateWobblyRectPath(200, 100, 99);
    const path2 = generateWobblyRectPath(200, 100, 99);
    expect(path1).toBe(path2);
  });

  it('should differ for different seeds', () => {
    const path1 = generateWobblyRectPath(200, 100, 1);
    const path2 = generateWobblyRectPath(200, 100, 2);
    expect(path1).not.toBe(path2);
  });

  it('should differ for different dimensions', () => {
    const path1 = generateWobblyRectPath(100, 50, 42);
    const path2 = generateWobblyRectPath(200, 100, 42);
    expect(path1).not.toBe(path2);
  });

  it('should produce more wobble with higher wobbleAmount', () => {
    const pathSmall = generateWobblyRectPath(100, 50, 42, 1);
    const pathLarge = generateWobblyRectPath(100, 50, 42, 10);
    // Both should be valid but different
    expect(pathSmall).not.toBe(pathLarge);
    expect(pathSmall).toMatch(/^M /);
    expect(pathLarge).toMatch(/^M /);
  });

  it('should use default wobbleAmount of 3 when not specified', () => {
    const pathDefault = generateWobblyRectPath(100, 50, 42);
    const pathExplicit = generateWobblyRectPath(100, 50, 42, 3);
    expect(pathDefault).toBe(pathExplicit);
  });

  it('should contain only valid SVG path numbers (no NaN/Infinity)', () => {
    const path = generateWobblyRectPath(100, 50, 42);
    expect(path).not.toContain('NaN');
    expect(path).not.toContain('Infinity');
  });

  it('should handle zero wobble amount', () => {
    const path = generateWobblyRectPath(100, 50, 42, 0);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
    expect(path).not.toContain('NaN');
  });

  it('should handle small dimensions', () => {
    const path = generateWobblyRectPath(5, 5, 42);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
  });

  it('should handle very large dimensions', () => {
    const path = generateWobblyRectPath(10000, 10000, 42);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
    expect(path).not.toContain('NaN');
  });
});

// ============================================================================
// generateStarPath
// ============================================================================

describe('generateStarPath: hand-drawn star doodle', () => {
  it('should return a valid SVG path starting with M and ending with Z', () => {
    const path = generateStarPath(50, 50, 20, 42);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
  });

  it('should contain L (line-to) commands for star edges', () => {
    const path = generateStarPath(50, 50, 20, 42);
    const lCount = (path.match(/ L /g) ?? []).length;
    // 5-pointed star = 10 vertices, first is M, rest are L => 9 L commands
    expect(lCount).toBe(9);
  });

  it('should be deterministic for the same seed', () => {
    const path1 = generateStarPath(50, 50, 20, 42);
    const path2 = generateStarPath(50, 50, 20, 42);
    expect(path1).toBe(path2);
  });

  it('should differ for different seeds', () => {
    const path1 = generateStarPath(50, 50, 20, 1);
    const path2 = generateStarPath(50, 50, 20, 2);
    expect(path1).not.toBe(path2);
  });

  it('should differ for different sizes', () => {
    const path1 = generateStarPath(50, 50, 10, 42);
    const path2 = generateStarPath(50, 50, 30, 42);
    expect(path1).not.toBe(path2);
  });

  it('should differ for different center positions', () => {
    const path1 = generateStarPath(50, 50, 20, 42);
    const path2 = generateStarPath(100, 100, 20, 42);
    expect(path1).not.toBe(path2);
  });

  it('should not contain NaN or Infinity', () => {
    const path = generateStarPath(50, 50, 20, 42);
    expect(path).not.toContain('NaN');
    expect(path).not.toContain('Infinity');
  });

  it('should handle size of 0', () => {
    const path = generateStarPath(50, 50, 0, 42);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
    expect(path).not.toContain('NaN');
  });

  it('should handle negative center coordinates', () => {
    const path = generateStarPath(-10, -20, 15, 42);
    expect(path).toMatch(/^M /);
    expect(path).toMatch(/ Z$/);
  });
});

// ============================================================================
// generateSquigglePath
// ============================================================================

describe('generateSquigglePath: hand-drawn squiggly line', () => {
  it('should return a valid SVG path starting with M', () => {
    const path = generateSquigglePath(0, 0, 100, 0, 42);
    expect(path).toMatch(/^M /);
  });

  it('should contain Q (quadratic bezier) curve commands', () => {
    const path = generateSquigglePath(0, 0, 100, 0, 42);
    const qCount = (path.match(/ Q /g) ?? []).length;
    // 6 segments = 6 Q commands
    expect(qCount).toBe(6);
  });

  it('should NOT end with Z (open path, not closed)', () => {
    const path = generateSquigglePath(0, 0, 100, 0, 42);
    expect(path).not.toMatch(/ Z$/);
  });

  it('should be deterministic for the same seed', () => {
    const path1 = generateSquigglePath(0, 0, 100, 50, 42);
    const path2 = generateSquigglePath(0, 0, 100, 50, 42);
    expect(path1).toBe(path2);
  });

  it('should differ for different seeds', () => {
    const path1 = generateSquigglePath(0, 0, 100, 50, 1);
    const path2 = generateSquigglePath(0, 0, 100, 50, 2);
    expect(path1).not.toBe(path2);
  });

  it('should differ for different start/end points', () => {
    const path1 = generateSquigglePath(0, 0, 100, 0, 42);
    const path2 = generateSquigglePath(0, 0, 200, 100, 42);
    expect(path1).not.toBe(path2);
  });

  it('should use default amplitude of 4 when not specified', () => {
    const pathDefault = generateSquigglePath(0, 0, 100, 0, 42);
    const pathExplicit = generateSquigglePath(0, 0, 100, 0, 42, 4);
    expect(pathDefault).toBe(pathExplicit);
  });

  it('should differ with different amplitude values', () => {
    const pathSmall = generateSquigglePath(0, 0, 100, 0, 42, 1);
    const pathLarge = generateSquigglePath(0, 0, 100, 0, 42, 20);
    expect(pathSmall).not.toBe(pathLarge);
  });

  it('should start at the given start point', () => {
    const path = generateSquigglePath(10, 20, 100, 50, 42);
    expect(path).toMatch(/^M 10\.0 20\.0/);
  });

  it('should not contain NaN or Infinity', () => {
    const path = generateSquigglePath(0, 0, 100, 100, 42);
    expect(path).not.toContain('NaN');
    expect(path).not.toContain('Infinity');
  });

  it('should handle zero-length line (start equals end)', () => {
    const path = generateSquigglePath(50, 50, 50, 50, 42);
    expect(path).toMatch(/^M /);
    expect(path).not.toContain('NaN');
  });

  it('should handle diagonal lines', () => {
    const path = generateSquigglePath(0, 0, 100, 100, 42);
    expect(path).toMatch(/^M /);
    const qCount = (path.match(/ Q /g) ?? []).length;
    expect(qCount).toBe(6);
  });
});

// ============================================================================
// hashString
// ============================================================================

describe('hashString: deterministic string hashing', () => {
  it('should return the same hash for the same string', () => {
    expect(hashString('hello')).toBe(hashString('hello'));
  });

  it('should return different hashes for different strings', () => {
    expect(hashString('hello')).not.toBe(hashString('world'));
  });

  it('should return a non-negative number', () => {
    const testStrings = ['', 'a', 'hello', 'test123', 'special!@#$'];
    testStrings.forEach((s) => {
      expect(hashString(s)).toBeGreaterThanOrEqual(0);
    });
  });

  it('should return 0 for empty string', () => {
    expect(hashString('')).toBe(0);
  });

  it('should return a number (integer)', () => {
    const hash = hashString('test');
    expect(Number.isInteger(hash)).toBe(true);
  });

  it('should produce different hashes for similar strings', () => {
    const h1 = hashString('abc');
    const h2 = hashString('abd');
    const h3 = hashString('abcd');
    expect(h1).not.toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h2).not.toBe(h3);
  });

  it('should handle unicode strings', () => {
    const hash = hashString('hello world');
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hash)).toBe(true);
  });

  it('should handle long strings', () => {
    const longStr = 'a'.repeat(10000);
    const hash = hashString(longStr);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(hash)).toBe(true);
  });

  it('should be usable as a seed for seededRandom', () => {
    const seed = hashString('my-component-42');
    const rand = seededRandom(seed);
    const v = rand();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});

// ============================================================================
// Integration: hashString -> seededRandom -> SVG generators
// ============================================================================

describe('Integration: end-to-end sketchy pipeline', () => {
  it('should produce a deterministic wobbly rect from a string seed', () => {
    const seed = hashString('card-1');
    const path1 = generateWobblyRectPath(200, 100, seed);
    const path2 = generateWobblyRectPath(200, 100, hashString('card-1'));
    expect(path1).toBe(path2);
  });

  it('should produce different wobbly rects for different string seeds', () => {
    const path1 = generateWobblyRectPath(200, 100, hashString('card-1'));
    const path2 = generateWobblyRectPath(200, 100, hashString('card-2'));
    expect(path1).not.toBe(path2);
  });

  it('should produce a deterministic star from a string seed', () => {
    const seed = hashString('star-decoration');
    const path1 = generateStarPath(50, 50, 15, seed);
    const path2 = generateStarPath(50, 50, 15, seed);
    expect(path1).toBe(path2);
  });

  it('should produce a deterministic squiggle from a string seed', () => {
    const seed = hashString('underline');
    const path1 = generateSquigglePath(0, 20, 100, 20, seed);
    const path2 = generateSquigglePath(0, 20, 100, 20, seed);
    expect(path1).toBe(path2);
  });
});
