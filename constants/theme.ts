/**
 * Sketchy design system tokens for WordPang hand-drawn style.
 */

export const SKETCHY_FONTS = {
  regular: 'Gaegu-Regular',
  bold: 'Gaegu-Bold',
} as const;

/** Irregular border radius presets — each corner differs for hand-drawn feel */
export const SKETCHY_RADIUS = {
  small: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 5,
  },
  medium: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 12,
  },
  large: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 16,
  },
} as const;

/** Crayon-style color palette */
export const CRAYON = {
  // Primary accents
  green: '#4CAF50',
  greenDark: '#388E3C',
  orange: '#FFB74D',
  orangeDark: '#F57C00',
  red: '#E57373',
  redDark: '#D32F2F',
  blue: '#64B5F6',
  blueDark: '#1976D2',
  purple: '#BA68C8',
  purpleDark: '#7B1FA2',
  yellow: '#FFD54F',
  yellowDark: '#F9A825',
  pink: '#F48FB1',
  pinkDark: '#C2185B',

  // Pencil/paper tones
  pencilLine: '#D4C5B2',
  pencilDark: '#8B7355',
  paper: '#FFF5EB',
  paperWhite: '#FFFDF7',
  paperDark: '#F5EDE0',
  inkBrown: '#2D1B0E',
  inkLight: '#5D4037',
  inkMuted: '#A1887F',
} as const;

/** Wobble animation constants */
export const WOBBLE = {
  rotation: 1.5, // degrees
  duration: 2000, // ms for full cycle
} as const;
