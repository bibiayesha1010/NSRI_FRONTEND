import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BreathingModal } from '@/components/BreathingModal';
import { useUI } from '@/context/UIContext';
import { useWellness } from '@/context/WellnessContext';
import { colors, radius, spacing, typography } from '@/theme/theme';

interface OneTapAction {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export const QuickActions: React.FC = () => {
  const { logWater, logExercise } = useWellness();
  const { openJournal, openBreathing } = useUI();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const actions: OneTapAction[] = [
    {
      key: 'breathe',
      icon: 'leaf-outline',
      label: '4-4-6 Breath',
      onPress: openBreathing,
    },
    {
      key: 'reset',
      icon: 'refresh-outline',
      label: '2-Min Reset',
      onPress: openBreathing,
    },
    {
      key: 'stretch',
      icon: 'body-outline',
      label: 'Stretch (5m)',
      onPress: () => {
        logExercise('stretching', 5);
        showToast('Logged 5 min of stretching 🧘');
      },
    },
    {
      key: 'water',
      icon: 'water-outline',
      label: '+250ml Water',
      onPress: () => {
        logWater(250);
        showToast('Logged 250 ml of water 💧');
      },
    },
    {
      key: 'walk',
      icon: 'walk-outline',
      label: 'Walk (10m)',
      onPress: () => {
        logExercise('walking', 10);
        showToast('Logged a 10 min walk 🚶');
      },
    },
    {
      key: 'mindful',
      icon: 'flower-outline',
      label: 'Mindful Break',
      onPress: openBreathing,
    },
    {
      key: 'journal',
      icon: 'book-outline',
      label: 'Quick Note',
      onPress: () => openJournal(),
    },
    {
      key: 'screen',
      icon: 'phone-portrait-outline',
      label: 'Screen Break',
      onPress: () => showToast('Screen-free moment started 🌱'),
    },
  ];

  return (
    <Card>
      <SectionHeader
        title="Quick Actions"
        subtitle="1-tap recovery & micro-habits"
        icon="flash-outline"
        iconColor={colors.accent}
      />

      <View style={styles.grid}>
        {actions.map((a) => (
          <Pressable
            key={a.key}
            style={({ pressed }) => [
              styles.actionTile,
              pressed && styles.actionTilePressed,
            ]}
            onPress={a.onPress}
            accessibilityRole="button"
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name={a.icon} size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </Card>
  );
};

export const GlobalBreathingModal: React.FC = () => {
  const { breathingOpen, closeBreathing } = useUI();
  return <BreathingModal visible={breathingOpen} onClose={closeBreathing} />;
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionTile: {
    width: '23%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionTilePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  toast: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  toastText: {
    ...typography.caption,
    color: colors.primaryDark,
    textAlign: 'center',
    fontWeight: '600',
  },
});