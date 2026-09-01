import { useUI } from '@/context/UIContext';
import { useWellness } from '@/context/WellnessContext';
import { JournalEntry, JournalTag, Mood, MOOD_META } from '@/models/types';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { JournalHistory } from './JournalHistory';

const ALL_TAGS: JournalTag[] = ['Work', 'Sleep', 'Relationships', 'Stress', 'Personal', 'Gratitude', 'Other'];
const MOODS: Mood[] = ['great', 'good', 'okay', 'low', 'difficult'];

const GUIDED_PROMPTS = [
  "What's one thing that's been on your mind today?",
  'What went well today?',
  "What is one thing you're grateful for today?",
  "Right now, I feel...",
  'What tends to happen before you feel this way?',
];

type Tab = 'write' | 'history';

export const JournalModal: React.FC = () => {
  const { journalOpen, journalPrefillPrompt, closeJournal } = useUI();
  const { addJournalEntry, updateJournalEntry } = useWellness();

  const [tab, setTab] = useState<Tab>('write');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState<string | undefined>(undefined);
  const [moodBefore, setMoodBefore] = useState<Mood | undefined>();
  const [moodAfter, setMoodAfter] = useState<Mood | undefined>();
  const [tags, setTags] = useState<JournalTag[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (journalOpen) {
      setTab('write');
      setPrompt(journalPrefillPrompt);
      setContent('');
      setMoodBefore(undefined);
      setMoodAfter(undefined);
      setTags([]);
      setEditingId(null);
    }
  }, [journalOpen, journalPrefillPrompt]);

  const toggleTag = (t: JournalTag) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleSave = () => {
    if (!content.trim()) return;
    if (editingId) {
      updateJournalEntry(editingId, { content: content.trim(), prompt, moodBefore, moodAfter, tags });
    } else {
      addJournalEntry({ content: content.trim(), prompt, moodBefore, moodAfter, tags });
    }
    closeJournal();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setContent(entry.content);
    setPrompt(entry.prompt);
    setMoodBefore(entry.moodBefore);
    setMoodAfter(entry.moodAfter);
    setTags(entry.tags);
    setTab('write');
  };

  return (
    <Modal visible={journalOpen} animationType="slide" onRequestClose={closeJournal}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal</Text>
          <Pressable onPress={closeJournal} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          <Pressable style={[styles.tabButton, tab === 'write' && styles.tabButtonActive]} onPress={() => setTab('write')}>
            <Text style={[styles.tabButtonText, tab === 'write' && styles.tabButtonTextActive]}>Write</Text>
          </Pressable>
          <Pressable style={[styles.tabButton, tab === 'history' && styles.tabButtonActive]} onPress={() => setTab('history')}>
            <Text style={[styles.tabButtonText, tab === 'history' && styles.tabButtonTextActive]}>History</Text>
          </Pressable>
        </View>

        {tab === 'write' ? (
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>Guided prompts (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
              {GUIDED_PROMPTS.map((p) => (
                <Pressable key={p} style={styles.promptChip} onPress={() => setPrompt(p)}>
                  <Text style={styles.promptChipText}>{p}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {prompt && (
              <View style={styles.selectedPromptBox}>
                <Text style={styles.selectedPromptText}>{prompt}</Text>
                <Pressable onPress={() => setPrompt(undefined)}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            )}

            <TextInput
              style={styles.contentInput}
              multiline
              placeholder="Write freely — this is just for you."
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              autoFocus
            />

            <Text style={styles.sectionLabel}>Mood before</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.moodButton, moodBefore === m && styles.moodButtonActive]}
                  onPress={() => setMoodBefore(m)}
                >
                  <Text style={styles.moodEmoji}>{MOOD_META[m].emoji}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Mood after (fill in once you're done)</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.moodButton, moodAfter === m && styles.moodButtonActive]}
                  onPress={() => setMoodAfter(m)}
                >
                  <Text style={styles.moodEmoji}>{MOOD_META[m].emoji}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Tags (optional)</Text>
            <View style={styles.tagsWrap}>
              {ALL_TAGS.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.tagChip, tags.includes(t) && styles.tagChipActive]}
                  onPress={() => toggleTag(t)}
                >
                  <Text style={[styles.tagChipText, tags.includes(t) && styles.tagChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.saveButton, !content.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!content.trim()}
            >
              <Text style={styles.saveButtonText}>{editingId ? 'Save changes' : 'Save entry'}</Text>
            </Pressable>
            <Text style={styles.privacyNote}>Your journal entries are private and stored only on this device.</Text>
          </ScrollView>
        ) : (
          <View style={styles.body}>
            <JournalHistory onEdit={handleEdit} />
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.primary,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  promptScroll: {
    marginBottom: spacing.sm,
  },
  promptChip: {
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxWidth: 220,
  },
  promptChipText: {
    ...typography.tiny,
    color: colors.secondary,
  },
  selectedPromptBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.secondarySoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedPromptText: {
    ...typography.caption,
    color: colors.secondary,
    flex: 1,
    marginRight: spacing.sm,
    fontStyle: 'italic',
  },
  contentInput: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 140,
    textAlignVertical: 'top',
    color: colors.text,
    ...typography.body,
  },
  moodRow: {
    flexDirection: 'row',
  },
  moodButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  moodButtonActive: {
    backgroundColor: colors.primarySoft,
  },
  moodEmoji: {
    fontSize: 18,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  privacyNote: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    fontStyle: 'italic',
  },
});