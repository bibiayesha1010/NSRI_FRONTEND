import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/common/Card';
import { ProgressBar } from '@/components/common/ProgressBar';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useWellness } from '@/context/WellnessContext';
import { nsriColor, nsriLabel, scoreDay } from '@/services/nsriService';
import { colors, radius, spacing, typography } from '@/theme/theme';

// ─── Contributing factor tile ─────────────────────────────────────────────────
interface FactorTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** 0-1 */
  progress: number;
  color: string;
  valueText: string;
  logged: boolean;
}

const FactorTile: React.FC<FactorTileProps> = ({
  icon,
  label,
  progress,
  color,
  valueText,
  logged,
}) => (
  <View style={styles.factorTile}>
    <View style={[styles.factorIcon, { backgroundColor: color + '22' }]}>
      <Ionicons name={icon} size={15} color={color} />
    </View>
    <Text style={styles.factorLabel}>{label}</Text>
    <Text style={[styles.factorValue, !logged && styles.factorValueMuted]}>{valueText}</Text>
    <ProgressBar progress={progress} color={logged ? color : colors.border} height={4} />
  </View>
);

// ─── Trend arrow ──────────────────────────────────────────────────────────────
interface TrendProps {
  today: number;
  yesterday: number | null;
}

const TrendIndicator: React.FC<TrendProps> = ({ today, yesterday }) => {
  if (yesterday == null) return null;

  const delta = today - yesterday;
  const abs = Math.abs(delta);

  if (abs < 3) {
    return (
      <View style={styles.trendRow}>
        <Ionicons name="remove-outline" size={14} color={colors.textMuted} />
        <Text style={styles.trendText}>Steady compared to yesterday</Text>
      </View>
    );
  }

  const up = delta > 0;
  return (
    <View style={styles.trendRow}>
      <Ionicons
        name={up ? 'trending-up-outline' : 'trending-down-outline'}
        size={14}
        color={up ? colors.exercise : colors.low}
      />
      <Text style={[styles.trendText, { color: up ? colors.exercise : colors.low }]}>
        {up ? '+' : ''}
        {delta} pts vs yesterday
      </Text>
    </View>
  );
};

// ─── Score arc gauge ──────────────────────────────────────────────────────────
interface GaugeProps {
  score: number;
  color: string;
}

const ScoreGauge: React.FC<GaugeProps> = ({ score, color }) => {
  const label = nsriLabel(score);

  return (
    <View style={styles.gaugeWrap}>
      <View style={[styles.gaugeOuter, { borderColor: color + '33' }]}>
        <View style={[styles.gaugeInner, { borderColor: color }]}>
          <Text style={[styles.gaugeScore, { color }]}>{score}</Text>
          <Text style={styles.gaugeOutOf}>/100</Text>
        </View>
      </View>
      <Text style={[styles.gaugeLabel, { color }]}>{label}</Text>
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const NSRICard: React.FC = () => {
  const { data, fullHistory } = useWellness();
  const { today } = data;

  const todayScore = useMemo(() => scoreDay(today), [today]);

  const yesterdayScore = useMemo(() => {
    const yesterday = fullHistory[fullHistory.length - 2];
    return yesterday ? scoreDay(yesterday) : null;
  }, [fullHistory]);

  const scoreColor = nsriColor(todayScore);

  // ─── Factor tiles config ─────────────────────────────────────────────────
  const factors: FactorTileProps[] = [
    {
      icon: 'moon-outline',
      label: 'Sleep',
      progress: Math.min(today.sleepHours / 8, 1),
      color: colors.primary,
      valueText: today.sleepHours > 0 ? `${today.sleepHours}h` : 'Not logged',
      logged: today.sleepHours > 0,
    },
    {
      icon: 'water-outline',
      label: 'Water',
      progress: Math.min(today.waterMl / today.waterGoalMl, 1),
      color: colors.water,
      valueText: `${(today.waterMl / 1000).toFixed(1)}L`,
      logged: today.waterMl > 0,
    },
    {
      icon: 'happy-outline',
      label: 'Mood',
      progress: today.moodScore != null ? (today.moodScore - 1) / 4 : 0,
      color: colors.secondary,
      valueText: today.moodScore != null ? `${today.moodScore.toFixed(1)}/5` : 'Not logged',
      logged: today.moodScore != null,
    },
    {
      icon: 'walk-outline',
      label: 'Exercise',
      progress: Math.min(today.exerciseMin / 30, 1),
      color: colors.exercise,
      valueText: `${today.exerciseMin}min`,
      logged: today.exerciseMin > 0,
    },
    {
      icon: 'pulse-outline',
      label: 'Stress',
      progress: today.stressScore != null ? (5 - today.stressScore) / 4 : 0,
      color: colors.attention,
      valueText: today.stressScore != null ? `${today.stressScore}/5` : 'Not logged',
      logged: today.stressScore != null,
    },
    {
      icon: 'battery-charging-outline',
      label: 'Energy',
      progress: today.energyScore != null ? (today.energyScore - 1) / 4 : 0,
      color: colors.accent,
      valueText: today.energyScore != null ? `${today.energyScore}/5` : 'Not logged',
      logged: today.energyScore != null,
    },
  ];

  return (
    <Card>
      <SectionHeader
        title="Your NSRI Score"
        subtitle="Neuro-Regulatory Status Index"
        icon="analytics-outline"
        iconColor={scoreColor}
      />

      {/* Score gauge + trend */}
      <View style={styles.scoreRow}>
        <ScoreGauge score={todayScore} color={scoreColor} />
        <View style={styles.scoreRight}>
          <TrendIndicator today={todayScore} yesterday={yesterdayScore} />
          <Text style={styles.scoreBlurb}>
            Your NSRI reflects today's sleep, hydration, mood, movement, stress, and energy.
            Log more data to improve accuracy.
          </Text>
        </View>
      </View>

      {/* Overall progress bar */}
      <View style={styles.overallBar}>
        <ProgressBar progress={todayScore / 100} color={scoreColor} height={8} />
        <View style={styles.barLabels}>
          <Text style={styles.barLabelLeft}>0</Text>
          <Text style={styles.barLabelRight}>100</Text>
        </View>
      </View>

      {/* Factor tiles grid */}
      <Text style={styles.factorsHeading}>Contributing factors</Text>
      <View style={styles.factorsGrid}>
        {factors.map((f) => (
          <FactorTile key={f.label} {...f} />
        ))}
      </View>
    </Card>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  gaugeWrap: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  gaugeOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeScore: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
  },
  gaugeOutOf: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  gaugeLabel: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  scoreRight: {
    flex: 1,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendText: {
    ...typography.tiny,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  scoreBlurb: {
    ...typography.tiny,
    color: colors.textMuted,
    lineHeight: 17,
  },
  overallBar: {
    marginBottom: spacing.lg,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  barLabelLeft: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  barLabelRight: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  factorsHeading: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorTile: {
    width: '48%',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  factorIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  factorLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    marginBottom: 2,
  },
  factorValue: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  factorValueMuted: {
    color: colors.textMuted,
    fontWeight: '400',
  },
});
