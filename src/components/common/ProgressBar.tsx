import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme/theme';

interface ProgressBarProps {
  /** 0 to 1 */
  progress: number;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  height = 6,
}) => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.pill,
  },
});
