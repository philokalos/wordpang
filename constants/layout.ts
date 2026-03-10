import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BOARD_PADDING = 16;
const MAX_BOARD_WIDTH = 400;

const boardWidth = Math.min(SCREEN_WIDTH - BOARD_PADDING * 2, MAX_BOARD_WIDTH);

export function getTileSize(wordLength: number): number {
  const gap = 6;
  const totalGaps = (wordLength - 1) * gap;
  const maxTileFromWidth = Math.floor((boardWidth - totalGaps) / wordLength);
  const maxTileFromHeight = 56;
  return Math.min(maxTileFromWidth, maxTileFromHeight);
}

export const TILE_GAP = 6;

export const KEY_HEIGHT = 48;
export const KEY_GAP = 4;

export function getKeyWidth(isSpecial: boolean): number {
  const availableWidth = SCREEN_WIDTH - 16;
  const normalKeyWidth = Math.floor((availableWidth - KEY_GAP * 9) / 10);
  return isSpecial ? normalKeyWidth * 1.5 : normalKeyWidth;
}

export const LAYOUT = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  boardWidth,
  boardPadding: BOARD_PADDING,
} as const;
