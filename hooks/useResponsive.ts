import { useWindowDimensions } from 'react-native';

const IPHONE_BASELINE = 390;

interface ResponsiveValues {
  screenWidth: number;
  screenHeight: number;
  isTablet: boolean;
  scale: number;
  fontScale: number;
  maxContentWidth: number;
  tileMaxHeight: number;
  keyHeight: number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const scale = Math.min(1.5, width / IPHONE_BASELINE);
  const fontScale = isTablet ? 1.15 : 1;

  return {
    screenWidth: width,
    screenHeight: height,
    isTablet,
    scale,
    fontScale,
    maxContentWidth: isTablet ? 600 : 400,
    tileMaxHeight: isTablet ? 72 : 56,
    keyHeight: isTablet ? 58 : 48,
  };
}
