import { useWellness } from '@/context/WellnessContext';
import { nsriColor, nsriLabel, scoreDay } from '@/services/nsriService';
import { colors, radius, shadowStyle, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const NSRICard: React.FC = () => {
  const { data, fullHistory } = useWellness();

  const todayScore = scoreDay(data.today);
  const yesterday = fullHistory.length > 1 ? fullHistory[fullHistory.length - 2] : null;
  const yesterdayScore = yesterday ? scoreDay(yesterday) : null;
  const change = yesterdayScore !== null ? todayScore - yesterdayScore : 0;

  const label = nsriLabel(todayScore);
  const statusColor = nsriColor(todayScore);

  // Calculate contributing factors
  const factors = [];
  if (data.today.sleepHours >= 7 && data.today.sleepQuality >= 4) {
    factors.push({ text: 'Consistent sleep', positive: true });
  } else if (data.today.sleepHours < 6 || data.today.sleepQuality < 2) {
    factors.push({ text: 'Low sleep quality', positive: false });
  }

  if (data.today.exerciseMin >= 30) {
    factors.push({ text: 'Regular movement', positive: true });
  } else if (data.today.exerciseMin === 0) {
    factors.push({ text: 'No movement yet', positive: false });
  }

  if (data.today.waterMl >= data.today.waterGoalMl * 0.8) {
    factors.push({ text: 'Good hydration', positive: true });
  } else if (data.today.waterMl < data.today.waterGoalMl * 0.5) {
    factors.push({ text: 'Lower hydration', positive: false });
  }

  if (data.today.caffeineMg > 400) {
    factors.push({ text: 'Higher caffeine intake', positive: false });
  }

  if (data.today.stressScore !== null && data.today.stressScore <= 2) {
    factors.push({ text: 'Lower stress', positive: true });
  } else if (data.today.stressScore !== null && data.today.stressScore >= 4) {
    factors.push({ text: 'Higher stress', positive: false });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderLeftColor: statusColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nervous System Status</Text>
            <Text style={styles.subtitle}>NSRI Score</Text>
          </View>
          <Ionicons name="pulse" size={24} color={statusColor} />
        </View>

        {/* Main Score Display */}
        <View style={styles.scoreRow}>
          <View style={[styles.scoreCircle, { borderColor: statusColor }]}>
            <Text style={[styles.scoreNumber, { color: statusColor }]}>{todayScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>

          <View style={styles.scoreInfo}>
            <Text style={[styles.scoreLabel, { color: statusColor }]}>{label}</Text>
            {change !== 0 && (
              <Text style={[styles.scoreChange, { color: change > 0 ? colors.exercise : colors.low }]}>
                {change > 0 ? '+' : ''}{change} from yesterday
              </Text>
            )}
            <Text style={styles.scoreDescription}>
              {todayScore >= 85
                ? 'You\'re well-regulated and resilient'
                : todayScore >= 70
                ? 'You\'re managing well'
                : todayScore >= 55
                ? 'You\'re balanced'
                : todayScore >= 40
                ? 'You could use some support'
                : 'Focus on self-care today'}
            </Text>
          </View>
        </View>

        {/* Contributing Factors */}
        {factors.length > 0 && (
          <View style={styles.factorsSection}>
            <Text style={styles.factorsTitle}>What's affecting your score:</Text>
            {factors.map((factor, idx) => (
              <View key={idx} style={styles.factorRow}>
                <Ionicons
                  name={factor.positive ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={factor.positive ? colors.exercise : colors.attention}
                  style={styles.factorIcon}
                />
                <Text style={[styles.factorText, !factor.positive && styles.factorTextNegative]}>
                  {factor.positive ? '✓' : '⚠'} {factor.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            NSRI is a self-tracking wellness indicator based on your logged data. It's not a medical diagnosis.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    ...shadowStyle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
  },
  scoreNumber: {
    ...typography.h1,
    fontWeight: '700',
  },
  scoreMax: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  scoreChange: {
    ...typography.caption,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  scoreDescription: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  factorsSection: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  factorsTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  factorIcon: {
    marginRight: spacing.sm,
  },
  factorText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  factorTextNegative: {
    color: colors.textMuted,
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.tiny,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});