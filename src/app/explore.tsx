import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { colors, spacing, typography } from '@/theme/theme';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Explore</Text>
        <Card>
          <SectionHeader
            title="Features & Resources"
            subtitle="More wellness modules coming soon"
            icon="compass-outline"
          />
          <Text style={styles.bodyText}>
            Track your daily recovery, monitor wellness trends, and reflect on your daily mood.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  bodyText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
