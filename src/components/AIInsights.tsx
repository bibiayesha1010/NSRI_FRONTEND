import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useWellness } from '@/context/WellnessContext';
import { InsightKind } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const KIND_ICON: Record<InsightKind, keyof typeof Ionicons.glyphMap> = {
  pattern: 'sparkles-outline',
  trend: 'trending-up-outline',
  suggestion: 'bulb-outline',
};

export const AIInsights: React.FC = () => {
  const { insights } = useWellness();

  return (
    <Card>
      <SectionHeader title="AI Insights" icon="sparkles-outline" iconColor={colors.secondary} />
      {insights.map((insight) => (
        <View key={insight.id} style={styles.row}>
          <View style={styles.iconWrap}>
            <Ionicons name={KIND_ICON[insight.kind]} size={16} color={colors.secondary} />
          </View>
          <Text style={styles.text}>{insight.text}</Text>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});