import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CaffeineTracker } from '@/components/CaffeineTracker';
import { ExerciseTracker } from '@/components/ExerciseTracker';
import { LifestyleTracker } from '@/components/LifestyleTracker';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { NSRICard } from '@/components/NSRICard';
import { GlobalBreathingModal, QuickActions } from '@/components/QuickActions';
import { RecoverySuggestions } from '@/components/RecoverySuggestions';
import { WaterTracker } from '@/components/WaterTracker';
import { colors, spacing, typography } from '@/theme/theme';

export default function HomeScreen() {
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Daily Wellness</Text>
          <Text style={styles.date}>{formattedToday}</Text>
        </View>

        {/* Feature 4: NSRI Recovery Card & Suggestions */}
        <NSRICard />
        <RecoverySuggestions />

        {/* Feature 5: Quick Actions Hub */}
        <QuickActions />

        {/* Feature 1: Mood Check-in */}
        <MoodCheckIn />

        {/* Feature 2: Water Tracking */}
        <WaterTracker />

        {/* Feature 3: Lifestyle Trackers */}
        <CaffeineTracker />
        <ExerciseTracker />
        <LifestyleTracker />
      </ScrollView>

      {/* Feature 5: Global Guided Breathing Modal */}
      <GlobalBreathingModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
