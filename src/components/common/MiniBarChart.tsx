import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/theme';

export interface BarDatum {
  label: string;
  value: number | null;
  highlight?: boolean;
}

interface MiniBarChartProps {
  data: BarDatum[];
  maxValue: number;
  color?: string;
  height?: number;
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  maxValue,
  color = colors.primary,
  height = 80,
}) => {
  if (!data.length) return null;

  return (
    <View style={styles.container}>
      {data.map((d, i) => {
        const progress = d.value != null && maxValue > 0 ? Math.min(d.value / maxValue, 1) : 0;
        const barHeight = Math.max(progress * height, d.value != null ? 4 : 0);
        const barColor = d.highlight ? color : color + '99';

        return (
          <View key={i} style={styles.column}>
            <View style={[styles.barTrack, { height }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: d.value == null ? colors.border : barColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.label, d.highlight && styles.labelHighlight]}>{d.label}</Text>
            {d.value != null && (
              <Text style={[styles.value, d.highlight && styles.valueHighlight]}>
                {d.value % 1 === 0 ? d.value : d.value.toFixed(1)}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    justifyContent: 'flex-end',
    width: '70%',
  },
  bar: {
    borderRadius: radius.sm,
    width: '100%',
  },
  label: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  labelHighlight: {
    color: colors.text,
    fontWeight: '700',
  },
  value: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
  },
  valueHighlight: {
    color: colors.text,
    fontWeight: '600',
  },
});
