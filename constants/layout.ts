import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BOARD_PADDING = 16;
const MAX_BOARD_WIDTH = 400;
const MAX_BOARD_WIDTH_TABLET = 560;

const boardWidth = Math.min(SCREEN_WIDTH - BOARD_PADDING * 2, MAX_BOARD_WIDTH);

export function getTileSize(wordLength: number, screenWidth?: number): number {
  const w = screenWidth ?? SCREEN_WIDTH;
  const isTablet = w >= 768;
  const maxBoard = Math.min(w - BOARD_PADDING * 2, isTablet ? MAX_BOARD_WIDTH_TABLET : MAX_BOARD_WIDTH);
  const gap = isTablet ? 8 : 6;
  const totalGaps = (wordLength - 1) * gap;
  const maxTileFromWidth = Math.floor((maxBoard - totalGaps) / wordLength);
  const maxTileFromHeight = isTablet ? 72 : 56;
  return Math.min(maxTileFromWidth, maxTileFromHeight);
}

export const TILE_GAP = 6;

export const KEY_HEIGHT = 48;
export const KEY_GAP = 4;

export function getKeyWidth(isSpecial: boolean, screenWidth?: number): number {
  const w = screenWidth ?? SCREEN_WIDTH;
  const isTablet = w >= 768;
  const maxKeyboardWidth = isTablet ? 600 : w;
  const availableWidth = maxKeyboardWidth - 16;
  const normalKeyWidth = Math.floor((availableWidth - KEY_GAP * 9) / 10);
  return isSpecial ? normalKeyWidth * 1.5 : normalKeyWidth;
}

export function getTileGap(screenWidth?: number): number {
  const w = screenWidth ?? SCREEN_WIDTH;
  return w >= 768 ? 8 : 6;
}

export const LAYOUT = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  boardWidth,
  boardPadding: BOARD_PADDING,
} as const;
