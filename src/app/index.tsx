import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CaffeineTracker } from '@/components/CaffeineTracker';
import { ExerciseTracker } from '@/components/ExerciseTracker';
import { JournalModal } from '@/components/JournalModal';
import { LifestyleTracker } from '@/components/LifestyleTracker';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { NSRICard } from '@/components/NSRICard';
import { GlobalBreathingModal, QuickActions } from '@/components/QuickActions';
import { RecoverySuggestions } from '@/components/RecoverySuggestions';
import { WaterTracker } from '@/components/WaterTracker';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useUI } from '@/context/UIContext';
import { useWellness } from '@/context/WellnessContext';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { friendlyDateTime } from '@/utils/dateUtils';

function JournalSection() {
  const { openJournal } = useUI();
  const { data } = useWellness();
  const recentEntry = data.journalEntries[0];

  return (
    <Card>
      <SectionHeader
        title="Journal & Reflection"
        subtitle={
          data.today.journaled
            ? 'Reflected today ✨'
            : 'Private space to clear your mind'
        }
        icon="book-outline"
        iconColor={colors.primaryDark}
        right={
          <Pressable
            style={styles.newJournalButton}
            onPress={() => openJournal()}
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={14} color={colors.textInverse} />
            <Text style={styles.newJournalButtonText}>Write</Text>
          </Pressable>
        }
      />

      {recentEntry ? (
        <Pressable
          style={styles.recentEntryPreview}
          onPress={() => openJournal()}
        >
          <View style={styles.recentEntryHeader}>
            <Text style={styles.recentEntryDate}>
              Latest: {friendlyDateTime(recentEntry.timestamp)}
            </Text>
            {recentEntry.tags.length > 0 && (
              <Text style={styles.recentEntryTag}>#{recentEntry.tags[0]}</Text>
            )}
          </View>
          <Text style={styles.recentEntryText} numberOfLines={2}>
            {recentEntry.content}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.emptyJournalPrompt}
          onPress={() => openJournal("What's one thing on your mind right now?")}
        >
          <Text style={styles.emptyJournalText}>
            "What's one thing on your mind right now?"
          </Text>
          <Text style={styles.emptyJournalSubtext}>Tap to reflect for 2 minutes →</Text>
        </Pressable>
      )}
    </Card>
  );
}

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

        {/* Feature 6: Journaling & Reflection */}
        <JournalSection />

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

      {/* Feature 6: Global Journal Modal */}
      <JournalModal />
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
  newJournalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  newJournalButtonText: {
    ...typography.tiny,
    color: colors.textInverse,
    fontWeight: '700',
    marginLeft: 4,
  },
  recentEntryPreview: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  recentEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  recentEntryDate: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  recentEntryTag: {
    ...typography.tiny,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  recentEntryText: {
    ...typography.body,
    color: colors.text,
  },
  emptyJournalPrompt: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyJournalText: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
  },
  emptyJournalSubtext: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
