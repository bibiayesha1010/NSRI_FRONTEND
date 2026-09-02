import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { Chip } from '@/components/common/Chip';
import { LineChart, ChartPoint } from '@/components/common/LineChart';
import { MiniBarChart } from '@/components/common/MiniBarChart';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useWellness } from '@/context/WellnessContext';
import { MetricKey } from '@/models/types';
import { scoreDay } from '@/services/nsriService';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { shortWeekday } from '@/utils/dateUtils';

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'nsri', label: 'NSRI Index' },
  { key: 'mood', label: 'Mood' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'water', label: 'Water' },
  { key: 'exercise', label: 'Exercise' },
  { key: 'stress', label: 'Stress' },
  { key: 'energy', label: 'Energy' },
  { key: 'caffeine', label: 'Caffeine' },
];

const METRIC_CONFIG: Record<
  MetricKey,
  { max: number; min?: number; color: string; unit: string }
> = {
  nsri: { max: 100, min: 0, color: colors.primaryDark, unit: 'pts' },
  mood: { max: 5, min: 1, color: colors.secondary, unit: '/5' },
  sleep: { max: 10, min: 0, color: colors.primary, unit: 'h' },
  water: { max: 3000, min: 0, color: colors.water, unit: 'ml' },
  exercise: { max: 60, min: 0, color: colors.exercise, unit: 'min' },
  stress: { max: 5, min: 1, color: colors.low, unit: '/5' },
  energy: { max: 5, min: 1, color: colors.accent, unit: '/5' },
  caffeine: { max: 400, min: 0, color: colors.caffeine, unit: 'mg' },
};

function buildInterpretation(
  metric: MetricKey,
  values: (number | null)[]
): string {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length < 3)
    return 'Keep logging over the next few days to see a clearer pattern here.';

  const firstHalf = nums.slice(0, Math.floor(nums.length / 2));
  const secondHalf = nums.slice(Math.floor(nums.length / 2));
  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;
  const delta = avg(secondHalf) - avg(firstHalf);
  const variance = avg(nums.map((n) => Math.pow(n - avg(nums), 2)));
  const stdDev = Math.sqrt(variance);

  switch (metric) {
    case 'nsri':
      return delta > 3
        ? 'Your NSRI recovery score is trending upward this week! 📈'
        : delta < -3
        ? 'Your NSRI has dipped a bit over the last few days — prioritize sleep and hydration.'
        : 'Your NSRI has held fairly steady and balanced this week.';
    case 'mood':
      if (stdDev < 0.6) return 'Your mood has been steady and consistent this week.';
      if (delta > 0.5) return 'Your mood has been trending upward over the past few days! 🌟';
      if (delta < -0.5) return 'Your mood dipped slightly recently — be gentle with yourself.';
      return 'Your mood has fluctuated across the week.';
    case 'sleep':
      if (stdDev > 1.2)
        return 'Less consistent sleep schedule over the last few days.';
      return 'Your sleep schedule has been steady and restorative.';
    case 'exercise':
      return nums.filter((n) => n > 0).length >= nums.length - 1
        ? "Great consistency! You've moved on most days this week."
        : 'Movement is logged on some days — aim for light daily stretches.';
    case 'water':
      return avg(nums) > 2000
        ? "Hydration is strong! You've been hitting your goal most days."
        : 'Hydration is a bit low — try drinking a glass of water when waking up.';
    case 'caffeine':
      return avg(nums) > 250
        ? 'Caffeine intake has run higher on several days.'
        : 'Caffeine intake has stayed moderate and balanced.';
    case 'energy':
      return delta > 0.5
        ? 'Energy levels are climbing higher through the week.'
        : 'Energy levels have stayed fairly steady.';
    case 'stress':
      if (delta > 0.5)
        return 'Stress has been creeping up — try a 4-4-6 breathing reset.';
      if (delta < -0.5)
        return 'Stress has eased compared to earlier this week.';
      return 'Stress has remained manageable and steady.';
    default:
      return '';
  }
}

export const WeeklyTrends: React.FC = () => {
  const { fullHistory } = useWellness();
  const [metric, setMetric] = useState<MetricKey>('nsri');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const { data, interpretation } = useMemo(() => {
    const values: (number | null)[] = fullHistory.map((day) => {
      switch (metric) {
        case 'nsri':
          return scoreDay(day);
        case 'mood':
          return day.moodScore;
        case 'sleep':
          return day.sleepHours || null;
        case 'water':
          return day.waterMl || null;
        case 'exercise':
          return day.exerciseMin;
        case 'stress':
          return day.stressScore;
        case 'energy':
          return day.energyScore;
        case 'caffeine':
          return day.caffeineMg || null;
        default:
          return null;
      }
    });

    const points: ChartPoint[] = fullHistory.map((day, i) => ({
      label: shortWeekday(day.dateISO),
      value: values[i],
      highlight: i === fullHistory.length - 1,
    }));

    return {
      data: points,
      interpretation: buildInterpretation(metric, values),
    };
  }, [fullHistory, metric]);

  const config = METRIC_CONFIG[metric];

  return (
    <Card>
      <SectionHeader
        title="Weekly Trends Graph"
        subtitle="7-day visual trajectory"
        icon="trending-up-outline"
        iconColor={config.color}
        right={
          <View style={styles.chartToggleRow}>
            <Pressable
              style={[
                styles.toggleBtn,
                chartType === 'line' && styles.toggleBtnActive,
              ]}
              onPress={() => setChartType('line')}
            >
              <Ionicons
                name="pulse-outline"
                size={14}
                color={chartType === 'line' ? colors.primary : colors.textMuted}
              />
            </Pressable>
            <Pressable
              style={[
                styles.toggleBtn,
                chartType === 'bar' && styles.toggleBtnActive,
              ]}
              onPress={() => setChartType('bar')}
            >
              <Ionicons
                name="bar-chart-outline"
                size={14}
                color={chartType === 'bar' ? colors.primary : colors.textMuted}
              />
            </Pressable>
          </View>
        }
      />

      {/* Metric Selector Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        {METRICS.map((m) => (
          <Chip
            key={m.key}
            label={m.label}
            selected={metric === m.key}
            onPress={() => setMetric(m.key)}
            tone="primary"
          />
        ))}
      </ScrollView>

      {/* Visual Chart (Line Graph or Bar Chart) */}
      <View style={styles.chartWrap}>
        {chartType === 'line' ? (
          <LineChart
            data={data}
            maxValue={config.max}
            minValue={config.min ?? 0}
            color={config.color}
            unit={config.unit}
            height={170}
          />
        ) : (
          <MiniBarChart
            data={data}
            maxValue={config.max}
            color={config.color}
            height={100}
          />
        )}
      </View>

      {/* Automated Interpretation */}
      <View style={styles.interpretationBox}>
        <Ionicons
          name="sparkles-outline"
          size={14}
          color={colors.primary}
          style={styles.interpretationIcon}
        />
        <Text style={styles.interpretationText}>{interpretation}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  chartToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chipScroll: {
    marginBottom: spacing.md,
  },
  chartWrap: {
    marginVertical: spacing.xs,
  },
  interpretationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  interpretationIcon: {
    marginRight: spacing.xs + 2,
    marginTop: 2,
  },
  interpretationText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
});