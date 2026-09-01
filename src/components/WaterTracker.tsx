import { ProgressBar } from '@/components/common/ProgressBar';
import { useWellness } from '@/context/WellnessContext';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const QUICK_AMOUNTS = [150, 250, 500];

export const WaterTracker: React.FC = () => {
  const { data, logWater, setWaterGoal } = useWellness();
  const { waterMl, waterGoalMl } = data.today;
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(waterGoalMl));

  const litersText = (ml: number) => `${(ml / 1000).toFixed(1)}L`;

  const saveGoal = () => {
    const parsed = parseInt(goalInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setWaterGoal(parsed);
    }
    setEditingGoal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="water-outline" size={18} color={colors.water} />
          <Text style={styles.title}>Water</Text>
        </View>
        {editingGoal ? (
          <View style={styles.goalEditRow}>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              style={styles.goalInput}
              onSubmitEditing={saveGoal}
              autoFocus
            />
            <Pressable onPress={saveGoal}>
              <Text style={styles.goalSave}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditingGoal(true)}>
            <Text style={styles.editGoalText}>Edit goal</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.amountText}>
        {litersText(waterMl)} <Text style={styles.amountMuted}>/ {litersText(waterGoalMl)}</Text>
      </Text>
      <ProgressBar progress={waterMl / waterGoalMl} color={colors.water} />

      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((amt) => (
          <Pressable key={amt} style={styles.quickButton} onPress={() => logWater(amt)}>
            <Text style={styles.quickButtonText}>+{amt} ml</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.waterSoft,
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
  editGoalText: {
    ...typography.tiny,
    color: colors.water,
    fontWeight: '700',
  },
  goalEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInput: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    width: 60,
    marginRight: spacing.sm,
    color: colors.text,
  },
  goalSave: {
    ...typography.tiny,
    color: colors.water,
    fontWeight: '700',
  },
  amountText: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  amountMuted: {
    ...typography.body,
    color: colors.textMuted,
  },
  quickRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  quickButton: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  quickButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
});