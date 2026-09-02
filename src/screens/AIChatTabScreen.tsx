import { useWellness } from '@/context/WellnessContext';
import { ChatMessage } from '@/models/types';
import { greetingForMood, sendMessageToBot } from '@/services/aiService';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const SUGGESTIONS = [
  'Breathing exercise',
  'Grounding exercise',
  'Journal prompt',
  'What can I do today?',
  'Why have I been feeling low?',
  'Tell me about my trends',
];

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const AIChatTabScreen: React.FC = () => {
  const { data, insights, fullHistory } = useWellness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const hasGreeted = useRef(false);

  useEffect(() => {
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      const latestMood = data.moodCheckIns.length ? data.moodCheckIns[data.moodCheckIns.length - 1].mood : undefined;
      setMessages([
        {
          id: genId(),
          role: 'bot',
          text: greetingForMood(latestMood),
          timestamp: Date.now(),
        },
      ]);
    }
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { id: genId(), role: 'user', text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const nsriScore = fullHistory.length ? Math.round(fullHistory[fullHistory.length - 1].moodScore ? 75 : 72) : 72;
      const overviewSummary = `Your dashboard shows a recent mood of ${data.moodCheckIns.length ? data.moodCheckIns[data.moodCheckIns.length - 1].mood : 'not logged yet'}, hydration at ${(data.today.waterMl / 1000).toFixed(1)}L, sleep at ${data.today.sleepHours || 0}h, and activity at ${data.today.exerciseMin || 0} minutes today.`;
      const { text: replyText, isCrisisResponse } = await sendMessageToBot(text, {
        today: data.today,
        recentCheckIns: data.moodCheckIns.slice(-7),
        latestInsightText: insights[0]?.text,
        nsriScore,
        overviewSummary,
      });
      const botMsg: ChatMessage = {
        id: genId(),
        role: 'bot',
        text: replyText,
        timestamp: Date.now(),
        isCrisisResponse,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={20} color={colors.textInverse} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Wellness Companion</Text>
              <Text style={styles.headerSubtitle}>Always here to listen</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbubble-ellipses" size={48} color={colors.secondary} />
              </View>
              <Text style={styles.emptyTitle}>Start a Conversation</Text>
              <Text style={styles.emptyText}>Tell me how you're feeling, ask for help, or chat about your wellness journey.</Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View key={msg.id} style={[styles.messageRow, msg.role === 'user' && styles.messageRowUser]}>
                {msg.role === 'bot' && (
                  <View style={styles.botAvatar}>
                    <Ionicons name="sparkles" size={16} color={colors.textInverse} />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.role === 'bot' ? styles.botBubble : styles.userBubble,
                    msg.isCrisisResponse && styles.crisisBubble,
                  ]}
                >
                  <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Suggestions */}
        {messages.length === 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            {SUGGESTIONS.map((suggestion, idx) => (
              <Pressable
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(suggestion)}
                disabled={sending}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { maxHeight: 100 }]}
              placeholder="Type your message..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!sending}
            />
            <Pressable
              style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
              onPress={() => handleSend()}
              disabled={!input.trim() || sending}
            >
              <Ionicons
                name="send"
                size={20}
                color={!input.trim() || sending ? colors.textMuted : colors.textInverse}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '85%',
  },
  botBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    backgroundColor: colors.secondary,
  },
  crisisBubble: {
    backgroundColor: colors.low,
    borderWidth: 1,
    borderColor: colors.attention,
  },
  messageText: {
    ...typography.body,
    color: colors.text,
  },
  userMessageText: {
    color: colors.textInverse,
  },
  suggestionsContainer: {
    paddingHorizontal: spacing.md,
    maxHeight: 50,
  },
  suggestionsContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  suggestionChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
