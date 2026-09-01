import { useUI } from '@/context/UIContext';
import { useWellness } from '@/context/WellnessContext';
import { ChatMessage } from '@/models/types';
import { greetingForMood, sendMessageToBot } from '@/services/aiService';
import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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

export const ChatModal: React.FC = () => {
  const { chatOpen, chatInitialMessage, closeChat } = useUI();
  const { data, insights } = useWellness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const hasGreeted = useRef(false);

  useEffect(() => {
    if (chatOpen && !hasGreeted.current) {
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
  }, [chatOpen]);

  useEffect(() => {
    if (chatOpen && chatInitialMessage) {
      handleSend(chatInitialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, chatInitialMessage]);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { id: genId(), role: 'user', text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { text: replyText, isCrisisResponse } = await sendMessageToBot(text, {
        today: data.today,
        recentCheckIns: data.moodCheckIns.slice(-7),
        latestInsightText: insights[0]?.text,
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
    <Modal visible={chatOpen} animationType="slide" onRequestClose={closeChat}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={16} color={colors.textInverse} />
            </View>
            <Text style={styles.headerTitle}>Wellness Companion</Text>
          </View>
          <Pressable onPress={closeChat} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.bubble,
                m.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
                m.isCrisisResponse && styles.bubbleCrisis,
              ]}
            >
              <Text style={[styles.bubbleText, m.role === 'user' && styles.bubbleTextUser]}>{m.text}</Text>
            </View>
          ))}
          {sending && (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <Text style={styles.bubbleText}>...</Text>
            </View>
          )}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.suggestionChip} onPress={() => handleSend(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type how you're feeling..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={() => handleSend()}
          />
          <Pressable style={styles.sendButton} onPress={() => handleSend()} accessibilityRole="button" accessibilityLabel="Send">
            <Ionicons name="arrow-up" size={18} color={colors.textInverse} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          This companion offers general wellness support and is not a therapist, doctor, or emergency service.
        </Text>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  messages: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  messagesContent: {
    paddingBottom: spacing.lg,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  bubbleBot: {
    backgroundColor: colors.secondarySoft,
    alignSelf: 'flex-start',
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  bubbleCrisis: {
    backgroundColor: colors.lowSoft,
    borderWidth: 1,
    borderColor: colors.low,
  },
  bubbleText: {
    ...typography.body,
    color: colors.text,
  },
  bubbleTextUser: {
    color: colors.textInverse,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexGrow: 0,
  },
  suggestionChip: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  suggestionText: {
    ...typography.tiny,
    color: colors.text,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    color: colors.text,
    ...typography.body,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    ...typography.tiny,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    fontStyle: 'italic',
  },
});