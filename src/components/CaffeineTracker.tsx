import { useWellness } from '@/context/WellnessContext';
import { CaffeineSource } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const SOURCES: { key: CaffeineSource; label: string }[] = [
  { key: 'coffee', label: 'Coffee' },
  { key: 'tea', label: 'Tea' },
  { key: 'energy_drink', label: 'Energy drink' },
  { key: 'soda', label: 'Soda' },
];

const HIGH_THRESHOLD_MG = 300;
const LATE_HOUR = 14; // 2pm — after this, nudge toward reducing further intake

export const CaffeineTracker: React.FC = () => {
  const { data, logCaffeine } = useWellness();
  const totalMg = data.today.caffeineMg;
  const isHigh = totalMg >= HIGH_THRESHOLD_MG;
  const isLate = new Date().getHours() >= LATE_HOUR;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="cafe-outline" size={18} color={colors.caffeine} />
          <Text style={styles.title}>Caffeine</Text>
        </View>
        <Text style={styles.totalText}>{Math.round(totalMg)} mg today</Text>
      </View>

      {isHigh && (
        <View style={styles.warningBanner}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.attention} />
          <Text style={styles.warningText}>Getting up there for today — no judgment, just a nudge.</Text>
        </View>
      )}
      {!isHigh && isLate && totalMg > 0 && (
        <View style={styles.warningBanner}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.warningText}>Getting later in the day — a caffeine-free drink might sit better tonight.</Text>
        </View>
      )}

      <View style={styles.sourceRow}>
        {SOURCES.map((s) => (
          <Pressable key={s.key} style={styles.sourceButton} onPress={() => logCaffeine(s.key)}>
            <Text style={styles.sourceButtonText}>+ {s.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.caffeineSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.bodyMedium,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  totalText: {
    ...typography.bodyMedium,
    color: colors.caffeine,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  warningText: {
    ...typography.tiny,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    flex: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sourceButton: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  sourceButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
});