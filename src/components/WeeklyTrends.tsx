import { Card } from '@/components/common/Card';
import { Chip } from '@/components/common/Chip';
import { BarDatum, MiniBarChart } from '@/components/common/MiniBarChart';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useWellness } from '@/context/WellnessContext';
import { MetricKey } from '@/models/types';
import { scoreDay } from '@/services/nsriService';
import { colors, spacing, typography } from '@/theme/theme';
import { shortWeekday } from '@/utils/dateUtils';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'mood', label: 'Mood' },
  { key: 'stress', label: 'Stress' },
  { key: 'energy', label: 'Energy' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'water', label: 'Water' },
  { key: 'caffeine', label: 'Caffeine' },
  { key: 'exercise', label: 'Exercise' },
  { key: 'nsri', label: 'NSRI' },
];

const METRIC_CONFIG: Record<MetricKey, { max: number; color: string; unit: string }> = {
  mood: { max: 5, color: colors.secondary, unit: '/5' },
  stress: { max: 5, color: colors.low, unit: '/5' },
  energy: { max: 5, color: colors.accent, unit: '/5' },
  sleep: { max: 9, color: colors.primary, unit: 'h' },
  water: { max: 3000, color: colors.water, unit: 'ml' },
  caffeine: { max: 400, color: colors.caffeine, unit: 'mg' },
  exercise: { max: 60, color: colors.exercise, unit: 'min' },
  nsri: { max: 100, color: colors.primaryDark, unit: '' },
};

function buildInterpretation(metric: MetricKey, values: (number | null)[]): string {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length < 3) return "Keep logging over the next few days to see a clearer pattern here.";

  const firstHalf = nums.slice(0, Math.floor(nums.length / 2));
  const secondHalf = nums.slice(Math.floor(nums.length / 2));
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const delta = avg(secondHalf) - avg(firstHalf);
  const variance = avg(nums.map((n) => Math.pow(n - avg(nums), 2)));
  const stdDev = Math.sqrt(variance);

  switch (metric) {
    case 'mood':
      if (stdDev < 0.6) return 'Your mood has been more stable this week.';
      if (delta > 0.5) return 'Your mood has been trending upward this week.';
      if (delta < -0.5) return 'Your mood has dipped a bit over the last few days.';
      return 'Your mood has moved around a bit this week.';
    case 'stress':
      if (delta > 0.5) return 'Stress has been creeping up over the week.';
      if (delta < -0.5) return 'Stress has eased compared to earlier in the week.';
      return 'Stress has stayed fairly steady this week.';
    case 'sleep':
      if (stdDev > 1) return "You've had less consistent sleep over the last few days.";
      return 'Your sleep schedule has been fairly consistent.';
    case 'exercise':
      return nums.filter((n) => n > 0).length >= nums.length - 1
        ? "You've been active most days this week."
        : "You've been more active on some days than others.";
    case 'water':
      return avg(nums) > 2000 ? "You've been hitting your hydration goal most days." : 'Hydration has been a bit inconsistent this week.';
    case 'caffeine':
      return avg(nums) > 250 ? 'Caffeine intake has run a little high on several days.' : 'Caffeine intake has stayed moderate this week.';
    case 'energy':
      return delta > 0.5 ? 'Energy has been picking up through the week.' : 'Energy levels have been fairly steady.';
    case 'nsri':
      return delta > 3 ? 'Your NSRI has been trending upward this week.' : delta < -3 ? 'Your NSRI has dipped a bit this week.' : 'Your NSRI has held fairly steady this week.';
    default:
      return '';
  }
}

export const WeeklyTrends: React.FC = () => {
  const { fullHistory } = useWellness();
  const [metric, setMetric] = useState<MetricKey>('mood');

  const { data, interpretation } = useMemo(() => {
    const values: (number | null)[] = fullHistory.map((day) => {
      switch (metric) {
        case 'mood':
          return day.moodScore;
        case 'stress':
          return day.stressScore;
        case 'energy':
          return day.energyScore;
        case 'sleep':
          return day.sleepHours || null;
        case 'water':
          return day.waterMl || null;
        case 'caffeine':
          return day.caffeineMg || null;
        case 'exercise':
          return day.exerciseMin;
        case 'nsri':
          return scoreDay(day);
        default:
          return null;
      }
    });

    const bars: BarDatum[] = fullHistory.map((day, i) => ({
      label: shortWeekday(day.dateISO),
      value: values[i],
      highlight: i === fullHistory.length - 1,
    }));

    return { data: bars, interpretation: buildInterpretation(metric, values) };
  }, [fullHistory, metric]);

  const config = METRIC_CONFIG[metric];

  return (
    <Card>
      <SectionHeader title="Weekly Trends" subtitle="Last 7 days" icon="trending-up-outline" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {METRICS.map((m) => (
          <Chip key={m.key} label={m.label} selected={metric === m.key} onPress={() => setMetric(m.key)} tone="primary" />
        ))}
      </ScrollView>

      <View style={styles.chartWrap}>
        <MiniBarChart data={data} maxValue={config.max} color={config.color} />
      </View>

      <View style={styles.interpretationBox}>
        <Text style={styles.interpretationText}>{interpretation}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  chipScroll: {
    marginBottom: spacing.lg,
  },
  chartWrap: {
    marginBottom: spacing.lg,
  },
  interpretationBox: {
    backgroundColor: colors.cardMuted,
    borderRadius: 12,
    padding: spacing.md,
  },
  interpretationText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});