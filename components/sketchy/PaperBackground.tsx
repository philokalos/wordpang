import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { CRAYON } from '../../constants/theme';

interface PaperBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  showDots?: boolean;
}

/**
 * Cream-colored paper background with optional faint dot grid pattern.
 * The dots are rendered as small Views for simplicity (no SVG needed).
 */
export default function PaperBackground({
  children,
  style,
  showDots = true,
}: PaperBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {showDots && (
        <View style={styles.dotGrid} pointerEvents="none">
          {DOT_ROWS.map((row, ri) => (
            <View key={ri} style={styles.dotRow}>
              {row.map((_, ci) => (
                <View key={ci} style={styles.dot} />
              ))}
            </View>
          ))}
        </View>
      )}
      {children}
    </View>
  );
}

// Pre-compute a grid of dots
const DOT_COUNT_X = 12;
const DOT_COUNT_Y = 20;
const DOT_ROWS = Array.from({ length: DOT_COUNT_Y }, () =>
  Array.from({ length: DOT_COUNT_X }),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CRAYON.paper,
  },
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 40,
    paddingHorizontal: 20,
    gap: 36,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(180, 160, 130, 0.15)',
  },
});
