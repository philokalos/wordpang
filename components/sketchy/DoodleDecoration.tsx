import React, { useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { generateStarPath, generateSquigglePath } from '../../utils/sketchy';
import { CRAYON } from '../../constants/theme';

type DoodleType = 'star' | 'squiggle';

interface DoodleDecorationProps {
  type: DoodleType;
  size?: number;
  color?: string;
  seed?: number;
  style?: ViewStyle;
}

export default function DoodleDecoration({
  type,
  size = 24,
  color = CRAYON.pencilLine,
  seed = 1,
  style,
}: DoodleDecorationProps) {
  const path = useMemo(() => {
    if (type === 'star') {
      return generateStarPath(size / 2, size / 2, size / 2 - 2, seed);
    }
    return generateSquigglePath(2, size / 2, size - 2, size / 2, seed);
  }, [type, size, seed]);

  return (
    <View style={style}>
      <Svg width={size} height={size}>
        <Path
          d={path}
          fill={type === 'star' ? color : 'none'}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
