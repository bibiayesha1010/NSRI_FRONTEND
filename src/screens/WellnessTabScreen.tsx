import { AIInsights } from '@/components/AIInsights';
import { LifestyleTracker } from '@/components/LifestyleTracker';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { QuickActions } from '@/components/QuickActions';
import { RecoverySuggestions } from '@/components/RecoverySuggestions';
import { TodaysOverview } from '@/components/TodaysOverview';
import { WeeklyTrends } from '@/components/WeeklyTrends';
import { colors, spacing } from '@/theme/theme';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

export const WellnessTabScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Overview Section */}
        <TodaysOverview />

        {/* Mood Check-In */}
        <View style={styles.section}>
          <MoodCheckIn />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions />
        </View>

        {/* Weekly Trends */}
        <View style={styles.section}>
          <WeeklyTrends />
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <AIInsights />
        </View>

        {/* Recovery Suggestions */}
        <View style={styles.section}>
          <RecoverySuggestions />
        </View>

        {/* Lifestyle Tracker */}
        <View style={styles.section}>
          <LifestyleTracker />
        </View>

        {/* Bottom spacing */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  spacer: {
    height: spacing.xl,
  },
});
