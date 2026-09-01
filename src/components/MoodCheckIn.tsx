import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useWellness } from '@/context/WellnessContext';
import { Mood, MOOD_META } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { friendlyDateTime } from '@/utils/dateUtils';

const MOODS: Mood[] = ['great', 'good', 'okay', 'low', 'difficult'];

export const MoodCheckIn: React.FC = () => {
  const { data, latestCheckIn, logMoodCheckIn } = useWellness();
  const [selectedMood, setSelectedMood] = useState<Mood>('good');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleLogMood = () => {
    logMoodCheckIn(selectedMood, note.trim() || undefined);
    setToast(`Logged mood: ${MOOD_META[selectedMood].label} ${MOOD_META[selectedMood].emoji}`);
    setNote('');
    setTimeout(() => setToast(null), 2500);
  };

  const todayScore = data.today.moodScore;

  return (
    <Card>
      <SectionHeader
        title="Mood Check-in"
        subtitle={
          todayScore !== null
            ? `Today's Average: ${todayScore.toFixed(1)} / 5.0`
            : 'How are you feeling right now?'
        }
        icon="heart-outline"
        iconColor={colors.secondary}
      />

      <View style={styles.moodRow}>
        {MOODS.map((moodKey) => {
          const meta = MOOD_META[moodKey];
          const isSelected = selectedMood === moodKey;
          return (
            <Pressable
              key={moodKey}
              style={[styles.moodButton, isSelected && styles.moodButtonSelected]}
              onPress={() => setSelectedMood(moodKey)}
              accessibilityRole="button"
            >
              <Text style={styles.moodEmoji}>{meta.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && styles.moodLabelSelected,
                ]}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={styles.noteInput}
        placeholder="Add a short note or reflection (optional)..."
        placeholderTextColor={colors.textMuted}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.submitButtonPressed,
        ]}
        onPress={handleLogMood}
        accessibilityRole="button"
      >
        <Text style={styles.submitButtonText}>
          Log {MOOD_META[selectedMood].label} Check-in
        </Text>
      </Pressable>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {latestCheckIn && (
        <View style={styles.latestContainer}>
          <Text style={styles.latestTitle}>Recent Check-in</Text>
          <View style={styles.latestRow}>
            <Text style={styles.latestEmoji}>
              {MOOD_META[latestCheckIn.mood].emoji}
            </Text>
            <View style={styles.latestInfo}>
              <Text style={styles.latestMoodLabel}>
                {MOOD_META[latestCheckIn.mood].label} ({latestCheckIn.score}/5)
              </Text>
              <Text style={styles.latestTime}>
                {friendlyDateTime(latestCheckIn.timestamp)}
              </Text>
              {latestCheckIn.note ? (
                <Text style={styles.latestNote}>"{latestCheckIn.note}"</Text>
              ) : null}
            </View>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.cardMuted,
    flex: 1,
    marginHorizontal: 3,
  },
  moodButtonSelected: {
    backgroundColor: colors.secondarySoft,
    borderColor: colors.secondary,
    borderWidth: 1.5,
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  moodLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  moodLabelSelected: {
    color: colors.secondary,
    fontWeight: '700',
  },
  noteInput: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    minHeight: 50,
    marginBottom: spacing.md,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    fontWeight: '700',
  },
  toast: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
  },
  toastText: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: 'center',
    fontWeight: '600',
  },
  latestContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  latestTitle: {
    ...typography.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  latestRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  latestEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  latestInfo: {
    flex: 1,
  },
  latestMoodLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  latestTime: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  latestNote: {
    ...typography.caption,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
