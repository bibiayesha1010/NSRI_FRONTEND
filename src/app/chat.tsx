import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWellness } from '@/context/WellnessContext';
import { ChatMessage } from '@/models/types';
import { greetingForMood, sendMessageToBot } from '@/services/aiService';
import { colors, radius, spacing, typography } from '@/theme/theme';

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

export default function ChatScreen() {
  const { data, insights } = useWellness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const hasGreeted = useRef(false);

  useEffect(() => {
    if (!hasGreeted.current) {
      hasGreeted.current = true;
      const latestMood = data.moodCheckIns.length
        ? data.moodCheckIns[data.moodCheckIns.length - 1].mood
        : undefined;
      setMessages([
        {
          id: genId(),
          role: 'bot',
          text: greetingForMood(latestMood),
          timestamp: Date.now(),
        },
      ]);
    }
  }, [data.moodCheckIns]);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const { text: replyText, isCrisisResponse } = await sendMessageToBot(
        text,
        {
          today: data.today,
          recentCheckIns: data.moodCheckIns.slice(-7),
          latestInsightText: insights[0]?.text,
        }
      );
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat Screen Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={18} color={colors.textInverse} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Wellness Companion</Text>
            <Text style={styles.headerSubtitle}>AI reflection & coping coach</Text>
          </View>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
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
              <Text
                style={[
                  styles.bubbleText,
                  m.role === 'user' && styles.bubbleTextUser,
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}
          {sending && (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <Text style={styles.bubbleText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Suggested Prompt Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsScroll}
          contentContainerStyle={styles.suggestionsContent}
        >
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              style={({ pressed }) => [
                styles.suggestionChip,
                pressed && styles.suggestionChipPressed,
              ]}
              onPress={() => handleSend(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Text Input Row */}
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
          <Pressable
            style={styles.sendButton}
            onPress={() => handleSend()}
            accessibilityRole="button"
            accessibilityLabel="Send"
          >
            <Ionicons name="arrow-up" size={18} color={colors.textInverse} />
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          General wellness companion · Not medical or emergency advice.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  messages: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
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
    marginBottom: spacing.xs,
    flexGrow: 0,
  },
  suggestionsContent: {
    paddingRight: spacing.lg,
  },
  suggestionChip: {
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  suggestionChipPressed: {
    opacity: 0.7,
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
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    paddingVertical: spacing.xs,
    backgroundColor: colors.card,
    fontStyle: 'italic',
  },
});
