import { CRAYON } from './theme';

export const COLORS = {
  correct: 'transparent',
  correctBorder: CRAYON.green,
  present: 'transparent',
  presentBorder: CRAYON.orange,
  absent: 'transparent',
  absentBorder: '#E0E0E0',

  tileBg: 'transparent',
  tileBorder: CRAYON.pencilLine,
  tileActiveBorder: CRAYON.inkBrown,

  keyDefault: 'transparent',
  keyDefaultText: CRAYON.inkBrown,
  keyDefaultBorder: '#E0E0E0',
  keyStatusText: CRAYON.inkBrown,

  background: CRAYON.paper,
  surface: 'transparent',
  surfaceAlt: 'transparent',

  purple: 'transparent',
  purpleDark: CRAYON.purple,
  purpleBg: 'transparent',
  purpleText: CRAYON.purpleDark,

  pink: 'transparent',
  pinkLight: 'transparent',
  pinkBgStrong: 'transparent',
  pinkBorder: CRAYON.pink,
  pinkText: CRAYON.pinkDark,

  correctBg: 'transparent',
  correctBgActive: 'transparent',

  achievementBg: 'transparent',
  categoryChipBg: 'transparent',

  textPrimary: CRAYON.inkBrown,
  textSecondary: CRAYON.inkLight,
  textMuted: CRAYON.inkMuted,

  overlay: 'rgba(255,255,255,0.85)',
} as const;

export type LetterStatusColor = {
  bg: string;
  border: string;
};

export const STATUS_COLORS: Record<string, LetterStatusColor> = {
  correct: { bg: COLORS.correct, border: COLORS.correctBorder },
  present: { bg: COLORS.present, border: COLORS.presentBorder },
  absent: { bg: COLORS.absent, border: COLORS.absentBorder },
};
