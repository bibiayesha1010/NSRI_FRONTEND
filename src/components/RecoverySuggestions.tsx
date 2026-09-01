import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useUI } from '@/context/UIContext';
import { useWellness } from '@/context/WellnessContext';
import { RecoveryCategory } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const CATEGORY_ICON: Record<RecoveryCategory, keyof typeof Ionicons.glyphMap> = {
  breathing: 'leaf-outline',
  grounding: 'earth-outline',
  water: 'water-outline',
  movement: 'walk-outline',
  rest: 'bed-outline',
  screen_break: 'phone-portrait-outline',
  social: 'people-outline',
  mindful_pause: 'flower-outline',
  sleep: 'moon-outline',
  journaling: 'book-outline',
};

export const RecoverySuggestions: React.FC = () => {
  const { recoverySuggestions, logWater, logExercise } = useWellness();
  const { openJournal, openBreathing } = useUI();

  const handleAction = (category: RecoveryCategory) => {
    switch (category) {
      case 'breathing':
      case 'mindful_pause':
        openBreathing();
        break;
      case 'journaling':
        openJournal();
        break;
      case 'water':
        logWater(250);
        break;
      case 'movement':
        logExercise('walking', 10);
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <SectionHeader title="Recovery Suggestions" icon="heart-outline" iconColor={colors.low} />
      {recoverySuggestions.map((s) => (
        <View key={s.id} style={styles.item}>
          <View style={styles.iconWrap}>
            <Ionicons name={CATEGORY_ICON[s.category]} size={16} color={colors.primaryDark} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.text}>{s.text}</Text>
            <Text style={styles.reason}>{s.reason}</Text>
          </View>
          <Pressable style={styles.actionButton} onPress={() => handleAction(s.category)}>
            <Text style={styles.actionButtonText}>Try it</Text>
          </Pressable>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  textWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.text,
  },
  reason: {
    ...typography.tiny,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  actionButtonText: {
    ...typography.tiny,
    color: colors.primaryDark,
    fontWeight: '700',
  },
});