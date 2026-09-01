import { Card } from '@/components/common/Card';
import { Chip } from '@/components/common/Chip';
import { ProgressBar } from '@/components/common/ProgressBar';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useWellness } from '@/context/WellnessContext';
import { MOOD_META } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { friendlyDate } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type ViewMode = 'daily' | 'weekly';

const Tile: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value: string;
  progress?: number;
  onPress?: () => void;
}> = ({ icon, color, label, value, progress, onPress }) => (
  <Pressable style={styles.tile} onPress={onPress} disabled={!onPress}>
    <View style={[styles.tileIcon, { backgroundColor: color + '22' }]}>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={styles.tileValue}>{value}</Text>
    {progress != null && <ProgressBar progress={progress} color={color} height={5} />}
  </Pressable>
);

export const LifestyleTracker: React.FC = () => {
  const { data, fullHistory, logSleep } = useWellness();
  const [mode, setMode] = useState<ViewMode>('daily');
  const [editingSleep, setEditingSleep] = useState(false);
  const [sleepHoursInput, setSleepHoursInput] = useState(String(data.today.sleepHours || ''));
  const [sleepQualityInput, setSleepQualityInput] = useState(data.today.sleepQuality || 0);

  const today = data.today;

  const saveSleep = () => {
    const hours = parseFloat(sleepHoursInput);
    if (!Number.isNaN(hours) && hours >= 0 && sleepQualityInput > 0) {
      logSleep(hours, sleepQualityInput);
    }
    setEditingSleep(false);
  };

  return (
    <Card>
      <SectionHeader
        title="Lifestyle Tracker"
        icon="stats-chart-outline"
        right={
          <View style={styles.modeRow}>
            <Chip label="Daily" selected={mode === 'daily'} onPress={() => setMode('daily')} tone="primary" />
            <Chip label="Weekly" selected={mode === 'weekly'} onPress={() => setMode('weekly')} tone="primary" />
          </View>
        }
      />

      {mode === 'daily' ? (
        <>
          <View style={styles.grid}>
            <Tile
              icon="moon-outline"
              color={colors.primary}
              label="Sleep"
              value={today.sleepHours > 0 ? `${today.sleepHours}h` : 'Not logged'}
              progress={today.sleepHours > 0 ? today.sleepHours / 8 : undefined}
              onPress={() => setEditingSleep(true)}
            />
            <Tile
              icon="water-outline"
              color={colors.water}
              label="Water"
              value={`${(today.waterMl / 1000).toFixed(1)}L`}
              progress={today.waterMl / today.waterGoalMl}
            />
            <Tile
              icon="cafe-outline"
              color={colors.caffeine}
              label="Caffeine"
              value={`${Math.round(today.caffeineMg)}mg`}
              progress={today.caffeineMg / 400}
            />
            <Tile
              icon="walk-outline"
              color={colors.exercise}
              label="Exercise"
              value={`${today.exerciseMin}min`}
              progress={today.exerciseMin / 30}
            />
            <Tile
              icon="happy-outline"
              color={colors.secondary}
              label="Mood"
              value={today.moodScore ? `${today.moodScore.toFixed(1)}/5` : 'Not logged'}
              progress={today.moodScore ? today.moodScore / 5 : undefined}
            />
            <Tile
              icon="pulse-outline"
              color={colors.attention}
              label="Stress"
              value={today.stressScore ? `${today.stressScore}/5` : 'Not logged'}
              progress={today.stressScore ? today.stressScore / 5 : undefined}
            />
            <Tile
              icon="battery-charging-outline"
              color={colors.accent}
              label="Energy"
              value={today.energyScore ? `${today.energyScore}/5` : 'Not logged'}
              progress={today.energyScore ? today.energyScore / 5 : undefined}
            />
            <Tile
              icon="book-outline"
              color={colors.primaryDark}
              label="Journaling"
              value={today.journaled ? 'Done today' : 'Not yet'}
            />
          </View>

          {editingSleep && (
            <View style={styles.sleepEditor}>
              <Text style={styles.sleepEditorLabel}>Hours slept</Text>
              <TextInput
                style={styles.sleepInput}
                keyboardType="decimal-pad"
                value={sleepHoursInput}
                onChangeText={setSleepHoursInput}
                placeholder="e.g. 7.5"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.sleepEditorLabel}>Sleep quality</Text>
              <View style={styles.qualityRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => setSleepQualityInput(n)}
                    style={[styles.qualityDot, sleepQualityInput === n && styles.qualityDotActive]}
                  >
                    <Text style={[styles.qualityDotText, sleepQualityInput === n && styles.qualityDotTextActive]}>{n}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.sleepButtonsRow}>
                <Pressable onPress={() => setEditingSleep(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={saveSleep} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.weeklyList}>
          {fullHistory.map((day, i) => (
            <View key={i} style={styles.weeklyRow}>
              <Text style={styles.weeklyDate}>{friendlyDate(day.dateISO)}</Text>
              <Text style={styles.weeklyEmoji}>
                {day.moodScore ? Object.values(MOOD_META).find((m) => Math.round(m.score) === Math.round(day.moodScore!))?.emoji ?? '—' : '—'}
              </Text>
              <Text style={styles.weeklyStat}>{day.sleepHours ? `${day.sleepHours}h` : '—'}</Text>
              <Text style={styles.weeklyStat}>{`${(day.waterMl / 1000).toFixed(1)}L`}</Text>
              <Text style={styles.weeklyStat}>{day.exerciseMin}min</Text>
            </View>
          ))}
          <View style={styles.weeklyLegendRow}>
            <Text style={styles.weeklyLegendLabel}>Date</Text>
            <Text style={styles.weeklyLegendLabel}>Mood</Text>
            <Text style={styles.weeklyLegendLabel}>Sleep</Text>
            <Text style={styles.weeklyLegendLabel}>Water</Text>
            <Text style={styles.weeklyLegendLabel}>Move</Text>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tileIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tileLabel: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  tileValue: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sleepEditor: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  sleepEditorLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  sleepInput: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: colors.text,
  },
  qualityRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  qualityDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  qualityDotActive: {
    backgroundColor: colors.primary,
  },
  qualityDotText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  qualityDotTextActive: {
    color: colors.textInverse,
  },
  sleepButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  saveButtonText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  weeklyList: {
    marginTop: spacing.xs,
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weeklyDate: {
    ...typography.tiny,
    color: colors.textMuted,
    width: 50,
  },
  weeklyEmoji: {
    fontSize: 16,
    width: 30,
    textAlign: 'center',
  },
  weeklyStat: {
    ...typography.tiny,
    color: colors.text,
    width: 50,
    textAlign: 'center',
  },
  weeklyLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  weeklyLegendLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    width: 50,
    textAlign: 'center',
  },
});