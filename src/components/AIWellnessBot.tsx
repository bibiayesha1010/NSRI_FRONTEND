import { useUI } from '@/context/UIContext';
import { useWellness } from '@/context/WellnessContext';
import { scoreDay } from '@/services/nsriService';
import { colors, radius, shadowStyle, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const AIWellnessBot: React.FC = () => {
  const { openChat } = useUI();
  const { data, latestCheckIn } = useWellness();

  const nsriScore = scoreDay(data.today);
  const moodLabel = latestCheckIn ? latestCheckIn.mood : 'not logged yet';
  const sleepSummary = data.today.sleepHours > 0 ? `${data.today.sleepHours}h sleep` : 'sleep not logged';
  const prompt = `Your dashboard is showing ${nsriScore}/100 NSRI, ${moodLabel} mood, and ${sleepSummary}. Want to talk through it?`;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>How are you feeling?</Text>

      <View style={styles.avatarWrap}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatarInner}>
            <Ionicons name="sparkles" size={30} color={colors.textInverse} />
          </View>
        </View>
      </View>

      <Text style={styles.prompt}>{prompt}</Text>

      <Pressable style={styles.talkButton} onPress={() => openChat()} accessibilityRole="button">
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textInverse} style={styles.talkIcon} />
        <Text style={styles.talkButtonText}>Talk to me</Text>
      </Pressable>

      <Text style={styles.disclaimer}>Your supportive wellness companion — not a doctor or therapist.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadowStyle,
  },
  eyebrow: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    marginBottom: spacing.lg,
  },
  avatarOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prompt: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  talkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  talkIcon: {
    marginRight: spacing.sm,
  },
  talkButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  disclaimer: {
    ...typography.tiny,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});