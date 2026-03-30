import { CRAYON } from './theme';

export const COLORS = {
  correct: CRAYON.green,
  correctBorder: CRAYON.greenDark,
  present: CRAYON.orange,
  presentBorder: CRAYON.orangeDark,
  absent: '#B0A899',
  absentBorder: '#8B7E6F',

  tileBg: CRAYON.paperWhite,
  tileBorder: CRAYON.pencilLine,
  tileActiveBorder: CRAYON.purple,

  keyDefault: '#EDE8DF',
  keyDefaultText: CRAYON.inkBrown,
  keyDefaultBorder: CRAYON.pencilLine,
  keyStatusText: '#ffffff',

  background: CRAYON.paper,
  surface: CRAYON.paperWhite,
  surfaceAlt: CRAYON.paperDark,

  purple: CRAYON.purple,
  purpleDark: CRAYON.purpleDark,
  purpleBg: '#F3E5F5',
  purpleText: CRAYON.purpleDark,

  pink: CRAYON.pink,
  pinkLight: '#FCE4EC',
  pinkBgStrong: '#FFEBEE',
  pinkBorder: CRAYON.pink,
  pinkText: CRAYON.pinkDark,

  correctBg: '#E8F5E9',
  correctBgActive: '#C8E6C9',

  achievementBg: '#FFF8E1',
  categoryChipBg: '#EDE7F6',

  textPrimary: CRAYON.inkBrown,
  textSecondary: CRAYON.inkLight,
  textMuted: CRAYON.inkMuted,

  overlay: 'rgba(0,0,0,0.4)',
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
