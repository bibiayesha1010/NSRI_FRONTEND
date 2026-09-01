import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/theme';

type Tone = 'primary' | 'secondary';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: Tone;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress, tone = 'primary' }) => {
  const activeColor = tone === 'secondary' ? colors.secondary : colors.primary;
  const activeSoft = tone === 'secondary' ? colors.secondarySoft : colors.primarySoft;

  return (
    <Pressable
      style={[styles.chip, selected && { backgroundColor: activeColor }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={[styles.label, selected && styles.labelSelected, !selected && { color: colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
  },
  label: {
    ...typography.tiny,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.textInverse,
  },
});
