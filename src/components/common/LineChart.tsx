import React, { useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { colors, radius, spacing, typography } from '@/theme/theme';

export interface ChartPoint {
  label: string;
  value: number | null;
  highlight?: boolean;
}

interface LineChartProps {
  data: ChartPoint[];
  maxValue: number;
  minValue?: number;
  color?: string;
  unit?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  maxValue,
  minValue = 0,
  color = colors.primary,
  unit = '',
  height = 160,
}) => {
  const [width, setWidth] = useState(320);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(
    data.length - 1
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setWidth(w);
  };

  if (!data.length) return null;

  const paddingHorizontal = 24;
  const paddingTop = 28;
  const paddingBottom = 28;
  const chartWidth = width - paddingHorizontal * 2;
  const chartHeight = height - paddingTop - paddingBottom;
  const range = maxValue - minValue || 1;

  // Compute (x, y) coordinates for each point
  const points = data.map((d, i) => {
    const x =
      paddingHorizontal +
      (data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2);
    const val = d.value ?? 0;
    const norm = Math.min(Math.max((val - minValue) / range, 0), 1);
    const y = paddingTop + chartHeight - norm * chartHeight;
    return { ...d, x, y, hasValue: d.value != null };
  });

  // Construct smooth SVG path using Catmull-Rom or cubic Bezier
  const validPoints = points.filter((p) => p.hasValue);

  let linePath = '';
  let areaPath = '';

  if (validPoints.length > 0) {
    linePath = `M ${validPoints[0].x} ${validPoints[0].y}`;

    for (let i = 0; i < validPoints.length - 1; i++) {
      const p0 = i > 0 ? validPoints[i - 1] : validPoints[i];
      const p1 = validPoints[i];
      const p2 = validPoints[i + 1];
      const p3 =
        i !== validPoints.length - 2
          ? validPoints[i + 2]
          : validPoints[i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    // Closed path for gradient fill
    const first = validPoints[0];
    const last = validPoints[validPoints.length - 1];
    const bottomY = paddingTop + chartHeight;
    areaPath = `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }

  const selectedPoint =
    selectedIdx != null && points[selectedIdx] ? points[selectedIdx] : null;

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Tooltip / Active Point Display */}
      {selectedPoint && selectedPoint.value != null && (
        <View
          style={[
            styles.tooltip,
            {
              left: Math.min(
                Math.max(selectedPoint.x - 45, 10),
                width - 100
              ),
              borderColor: color,
            },
          ]}
        >
          <Text style={styles.tooltipLabel}>{selectedPoint.label}</Text>
          <Text style={[styles.tooltipValue, { color }]}>
            {selectedPoint.value % 1 === 0
              ? selectedPoint.value
              : selectedPoint.value.toFixed(1)}{' '}
            {unit}
          </Text>
        </View>
      )}

      {/* SVG Trend Graph */}
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="85%" stopColor={color} stopOpacity="0.03" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal Grid lines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = paddingTop + chartHeight * pct;
          return (
            <Line
              key={idx}
              x1={paddingHorizontal}
              y1={y}
              x2={width - paddingHorizontal}
              y2={y}
              stroke={colors.border}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {/* Gradient fill under the trend line */}
        {areaPath ? (
          <Path d={areaPath} fill="url(#gradientArea)" />
        ) : null}

        {/* Smooth Trend Line */}
        {linePath ? (
          <Path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {/* Data Point Circles */}
        {points.map((p, i) => {
          if (!p.hasValue) return null;
          const isSelected = selectedIdx === i;
          return (
            <React.Fragment key={i}>
              {/* Outer halo if selected */}
              {isSelected && (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r="9"
                  fill={color}
                  fillOpacity="0.25"
                />
              )}
              {/* Data dot */}
              <Circle
                cx={p.x}
                cy={p.y}
                r={isSelected ? '5.5' : '4'}
                fill={colors.card}
                stroke={color}
                strokeWidth={isSelected ? '3' : '2.5'}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Interactive touch targets & X-Axis Day Labels */}
      <View style={styles.labelsRow}>
        {points.map((p, i) => {
          const isSelected = selectedIdx === i;
          return (
            <Pressable
              key={i}
              style={styles.labelTouch}
              onPress={() => setSelectedIdx(i)}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                  isSelected && { color },
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    marginVertical: spacing.xs,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tooltipValue: {
    ...typography.tiny,
    fontWeight: '700',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: -8,
  },
  labelTouch: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '500',
  },
  dayLabelSelected: {
    fontWeight: '700',
  },
});
