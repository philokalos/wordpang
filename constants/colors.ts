export const COLORS = {
  correct: '#22c55e',
  correctBorder: '#16a34a',
  present: '#eab308',
  presentBorder: '#ca8a04',
  absent: '#9ca3af',
  absentBorder: '#6b7280',

  tileBg: '#ffffff',
  tileBorder: '#d1d5db',
  tileActiveBorder: '#a855f7',

  keyDefault: '#e5e7eb',
  keyDefaultText: '#1f2937',
  keyDefaultBorder: '#d1d5db',
  keyStatusText: '#ffffff',

  background: '#FFF0F5',
  surface: '#ffffff',
  surfaceAlt: '#fdf2f8',

  purple: '#a855f7',
  purpleDark: '#9333ea',
  purpleBg: '#f5f3ff',
  purpleText: '#7c3aed',

  pink: '#ec4899',
  pinkLight: '#fce7f3',
  pinkBorder: '#f9a8d4',
  pinkText: '#db2777',

  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',

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
