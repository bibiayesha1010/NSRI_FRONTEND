import { useWellness } from '@/context/WellnessContext';
import { ExerciseType } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TYPES: { key: ExerciseType; label: string }[] = [
  { key: 'walking', label: 'Walking' },
  { key: 'stretching', label: 'Stretching' },
  { key: 'running', label: 'Running' },
  { key: 'yoga', label: 'Yoga' },
  { key: 'gym', label: 'Gym' },
  { key: 'other', label: 'Other' },
];

const DURATIONS = [10, 20, 30];

export const ExerciseTracker: React.FC = () => {
  const { data, logExercise } = useWellness();
  const [selectedType, setSelectedType] = useState<ExerciseType>('walking');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="walk-outline" size={18} color={colors.exercise} />
          <Text style={styles.title}>Exercise</Text>
        </View>
        <Text style={styles.totalText}>{data.today.exerciseMin} min today</Text>
      </View>

      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setSelectedType(t.key)}
            style={[styles.typeChip, selectedType === t.key && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, selectedType === t.key && styles.typeChipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.durationRow}>
        {DURATIONS.map((d) => (
          <Pressable key={d} style={styles.durationButton} onPress={() => logExercise(selectedType, d)}>
            <Text style={styles.durationButtonText}>+{d} min</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.exerciseSoft,
    borderRadius: radius.md,
    padding: spacing.md,
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
    color: colors.exercise,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  typeChip: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeChipActive: {
    backgroundColor: colors.exercise,
  },
  typeChipText: {
    ...typography.tiny,
    color: colors.text,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: colors.textInverse,
  },
  durationRow: {
    flexDirection: 'row',
  },
  durationButton: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  durationButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
});