import { useWellness } from '@/context/WellnessContext';
import { JournalEntry, JournalTag, MOOD_META } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { friendlyDateTime } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const ALL_TAGS: JournalTag[] = ['Work', 'Sleep', 'Relationships', 'Stress', 'Personal', 'Gratitude', 'Other'];

interface JournalHistoryProps {
  onEdit: (entry: JournalEntry) => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({ onEdit }) => {
  const { data, deleteJournalEntry } = useWellness();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<JournalTag | null>(null);

  const filtered = useMemo(() => {
    return data.journalEntries.filter((e) => {
      const matchesSearch = search.trim().length === 0 || e.content.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !activeTag || e.tags.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [data.journalEntries, search, activeTag]);

  const confirmDelete = (id: string) => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your entries"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
        <Pressable
          style={[styles.tagChip, !activeTag && styles.tagChipActive]}
          onPress={() => setActiveTag(null)}
        >
          <Text style={[styles.tagChipText, !activeTag && styles.tagChipTextActive]}>All</Text>
        </Pressable>
        {ALL_TAGS.map((t) => (
          <Pressable
            key={t}
            style={[styles.tagChip, activeTag === t && styles.tagChipActive]}
            onPress={() => setActiveTag(activeTag === t ? null : t)}
          >
            <Text style={[styles.tagChipText, activeTag === t && styles.tagChipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list}>
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>
            {data.journalEntries.length === 0
              ? "No entries yet — your journal is private and just for you."
              : 'No entries match your search.'}
          </Text>
        )}
        {filtered.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeaderRow}>
              <Text style={styles.entryDate}>{friendlyDateTime(entry.timestamp)}</Text>
              <View style={styles.entryActions}>
                <Pressable onPress={() => onEdit(entry)} style={styles.entryActionButton}>
                  <Ionicons name="create-outline" size={16} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => confirmDelete(entry.id)} style={styles.entryActionButton}>
                  <Ionicons name="trash-outline" size={16} color={colors.low} />
                </Pressable>
              </View>
            </View>
            {entry.prompt && <Text style={styles.entryPrompt}>{entry.prompt}</Text>}
            <Text style={styles.entryContent} numberOfLines={4}>{entry.content}</Text>
            <View style={styles.entryFooterRow}>
              {entry.moodBefore && (
                <Text style={styles.entryMood}>
                  {MOOD_META[entry.moodBefore].emoji}
                  {entry.moodAfter ? ` → ${MOOD_META[entry.moodAfter].emoji}` : ''}
                </Text>
              )}
              <View style={styles.entryTags}>
                {entry.tags.map((t) => (
                  <View key={t} style={styles.entryTagPill}>
                    <Text style={styles.entryTagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
    color: colors.text,
    ...typography.body,
  },
  tagScroll: {
    marginBottom: spacing.md,
  },
  tagChip: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
  },
  tagChipActive: {
    backgroundColor: colors.primary,
  },
  tagChipText: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tagChipTextActive: {
    color: colors.textInverse,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  entryCard: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryDate: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  entryActions: {
    flexDirection: 'row',
  },
  entryActionButton: {
    marginLeft: spacing.md,
  },
  entryPrompt: {
    ...typography.tiny,
    color: colors.primaryDark,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  entryContent: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  entryFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryMood: {
    fontSize: 14,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'flex-end',
  },
  entryTagPill: {
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  entryTagText: {
    ...typography.tiny,
    color: colors.textMuted,
  },
});