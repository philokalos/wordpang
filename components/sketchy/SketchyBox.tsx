import React, { useMemo, useState } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { generateWobblyRectPath } from '../../utils/sketchy';
import { CRAYON } from '../../constants/theme';

interface SketchyBoxProps {
  children: React.ReactNode;
  style?: ViewStyle;
  seed?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
}

export default function SketchyBox({
  children,
  style,
  seed = 42,
  strokeColor = CRAYON.pencilDark,
  strokeWidth = 2,
  fillColor = CRAYON.paperWhite,
}: SketchyBoxProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const path = useMemo(() => {
    if (layout.width === 0 || layout.height === 0) return '';
    return generateWobblyRectPath(layout.width, layout.height, seed);
  }, [layout.width, layout.height, seed]);

  return (
    <View
      style={style}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      {layout.width > 0 && layout.height > 0 && (
        <Svg
          width={layout.width}
          height={layout.height}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Path
            d={path}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
