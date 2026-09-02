import { Card } from '@/components/common/Card';
import { useWellness } from '@/context/WellnessContext';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const TodaysOverview: React.FC = () => {
  const { data } = useWellness();
  const { today } = data;

  // Calculate overall wellness status
  const getWellnessStatus = () => {
    const scores = [];
    if (today.moodScore) scores.push(today.moodScore);
    if (today.stressScore) scores.push(5 - today.stressScore); // Inverse of stress
    if (today.energyScore) scores.push(today.energyScore);
    
    const avg = scores.length ? scores.reduce((a, b) => a + b) / scores.length : null;
    
    if (avg === null) return 'Get Started';
    if (avg >= 4) return 'Doing Well';
    if (avg >= 3.5) return 'Balanced';
    if (avg >= 2.5) return 'Needs Attention';
    return 'Take It Easy Today';
  };

  const statusText = getWellnessStatus();
  
  // Determine status color
  const getStatusColor = () => {
    switch (statusText) {
      case 'Doing Well': return colors.exercise;
      case 'Balanced': return colors.primary;
      case 'Needs Attention': return colors.attention;
      case 'Take It Easy Today': return colors.low;
      default: return colors.textMuted;
    }
  };

  const statusColor = getStatusColor();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Overview</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* Current Mood */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="happy-outline" size={20} color={colors.secondary} />
          </View>
          <Text style={styles.gridLabel}>Mood</Text>
          <Text style={styles.gridValue}>
            {today.moodScore ? `${today.moodScore.toFixed(1)}/5` : 'Not logged'}
          </Text>
        </View>

        {/* Recent Mood Trend */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="trending-up-outline" size={20} color={colors.secondary} />
          </View>
          <Text style={styles.gridLabel}>Trend</Text>
          <Text style={styles.gridValue}>Stable</Text>
        </View>

        {/* NSRI Score */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="pulse" size={20} color={colors.primary} />
          </View>
          <Text style={styles.gridLabel}>NSRI</Text>
          <Text style={styles.gridValue}>See Below</Text>
        </View>

        {/* Sleep */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="moon-outline" size={20} color={colors.accent} />
          </View>
          <Text style={styles.gridLabel}>Sleep</Text>
          <Text style={styles.gridValue}>
            {today.sleepHours > 0 ? `${today.sleepHours}h` : 'Not logged'}
          </Text>
        </View>

        {/* Water Intake */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.water + '20' }]}>
            <Ionicons name="water-outline" size={20} color={colors.water} />
          </View>
          <Text style={styles.gridLabel}>Water</Text>
          <Text style={styles.gridValue}>
            {today.waterMl > 0 ? `${(today.waterMl / 1000).toFixed(1)}L` : '0L'}
          </Text>
        </View>

        {/* Caffeine Intake */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.caffeine + '20' }]}>
            <Ionicons name="cafe-outline" size={20} color={colors.caffeine} />
          </View>
          <Text style={styles.gridLabel}>Caffeine</Text>
          <Text style={styles.gridValue}>
            {today.caffeineMg > 0 ? `${today.caffeineMg}mg` : 'None'}
          </Text>
        </View>

        {/* Exercise/Activity */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.exercise + '20' }]}>
            <Ionicons name="walk-outline" size={20} color={colors.exercise} />
          </View>
          <Text style={styles.gridLabel}>Activity</Text>
          <Text style={styles.gridValue}>
            {today.exerciseMin > 0 ? `${today.exerciseMin}m` : '0m'}
          </Text>
        </View>

        {/* Stress Level */}
        <View style={styles.gridItem}>
          <View style={[styles.gridIcon, { backgroundColor: colors.low + '20' }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.low} />
          </View>
          <Text style={styles.gridLabel}>Stress</Text>
          <Text style={styles.gridValue}>
            {today.stressScore ? `${today.stressScore}/5` : 'Not logged'}
          </Text>
        </View>
      </View>

      {/* Quick Recommendations */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.recommendationsTitle}>Personalized Recommendations</Text>
        <View style={styles.recommendationsList}>
          {today.waterMl < today.waterGoalMl * 0.5 && (
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationDot}>💧</Text>
              <Text style={styles.recommendationText}>Drink some water</Text>
            </View>
          )}
          {today.exerciseMin === 0 && new Date().getHours() > 10 && (
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationDot}>🚶</Text>
              <Text style={styles.recommendationText}>Take a short walk</Text>
            </View>
          )}
          {today.stressScore !== null && today.stressScore >= 4 && (
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationDot}>🌬️</Text>
              <Text style={styles.recommendationText}>Try a breathing exercise</Text>
            </View>
          )}
          {today.caffeineMg > 300 && new Date().getHours() > 14 && (
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationDot}>☕</Text>
              <Text style={styles.recommendationText}>Reduce caffeine for today</Text>
            </View>
          )}
          {!today.journaled && (
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationDot}>📝</Text>
              <Text style={styles.recommendationText}>Reflect in your journal</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginBottom: spacing.lg,
    borderRadius: 0,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  gridItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  gridLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  gridValue: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  recommendationsSection: {
    backgroundColor: colors.cardMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recommendationsTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  recommendationsList: {
    gap: spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  recommendationDot: {
    fontSize: 16,
  },
  recommendationText: {
    ...typography.body,
    color: colors.text,
  },
});
