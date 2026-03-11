/**
 * Pure utility functions for sketchy/hand-drawn SVG paths and seeded randomness.
 */

/** Simple seeded PRNG (mulberry32) for deterministic "randomness" per element */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate a wobbly rectangle SVG path (for SketchyBox borders) */
export function generateWobblyRectPath(
  width: number,
  height: number,
  seed: number,
  wobbleAmount = 3,
): string {
  const rand = seededRandom(seed);
  const w = (max: number) => (rand() - 0.5) * 2 * max;

  const m = wobbleAmount;
  const points = [
    // Top edge
    { x: 2 + w(m), y: 2 + w(m) },
    { x: width * 0.25 + w(m), y: 1 + w(m) },
    { x: width * 0.5 + w(m), y: 2 + w(m) },
    { x: width * 0.75 + w(m), y: 1 + w(m) },
    { x: width - 2 + w(m), y: 2 + w(m) },
    // Right edge
    { x: width - 1 + w(m), y: height * 0.25 + w(m) },
    { x: width - 2 + w(m), y: height * 0.5 + w(m) },
    { x: width - 1 + w(m), y: height * 0.75 + w(m) },
    { x: width - 2 + w(m), y: height - 2 + w(m) },
    // Bottom edge
    { x: width * 0.75 + w(m), y: height - 1 + w(m) },
    { x: width * 0.5 + w(m), y: height - 2 + w(m) },
    { x: width * 0.25 + w(m), y: height - 1 + w(m) },
    { x: 2 + w(m), y: height - 2 + w(m) },
    // Left edge
    { x: 1 + w(m), y: height * 0.75 + w(m) },
    { x: 2 + w(m), y: height * 0.5 + w(m) },
    { x: 1 + w(m), y: height * 0.25 + w(m) },
  ];

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i - 1].x + points[i].x) / 2 + w(m * 0.5);
    const cp1y = (points[i - 1].y + points[i].y) / 2 + w(m * 0.5);
    d += ` Q ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  // Close back to start
  const last = points[points.length - 1];
  const first = points[0];
  const cpx = (last.x + first.x) / 2 + w(m * 0.5);
  const cpy = (last.y + first.y) / 2 + w(m * 0.5);
  d += ` Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${first.x.toFixed(1)} ${first.y.toFixed(1)} Z`;

  return d;
}

/** Generate a star doodle SVG path */
export function generateStarPath(cx: number, cy: number, size: number, seed: number): string {
  const rand = seededRandom(seed);
  const points = 5;
  const outerR = size;
  const innerR = size * 0.4;
  let d = '';

  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const wobble = (rand() - 0.5) * size * 0.15;
    const x = cx + (r + wobble) * Math.cos(angle);
    const y = cy + (r + wobble) * Math.sin(angle);
    d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ' Z';
}

/** Generate a squiggly line path */
export function generateSquigglePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  amplitude = 4,
): string {
  const rand = seededRandom(seed);
  const segments = 6;
  let d = `M ${x1.toFixed(1)} ${y1.toFixed(1)}`;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const cpx = x1 + (x2 - x1) * (t - 0.5 / segments) + (rand() - 0.5) * amplitude * 2;
    const cpy = y1 + (y2 - y1) * (t - 0.5 / segments) + (rand() - 0.5) * amplitude * 2;
    d += ` Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  return d;
}

/** Simple hash from string for deterministic seed */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}
