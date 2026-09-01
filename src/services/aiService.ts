import { DayData, MoodCheckIn, Mood } from '@/models/types';

// Crisis keywords – if any appear, return a crisis-safe response
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'hurt myself',
  'self-harm', 'self harm', 'want to die', 'no reason to live',
];

const BREATHING_KEYWORDS = ['breathing', 'breath', 'breathe', 'anxiety', 'panic', 'calm down'];
const GROUNDING_KEYWORDS = ['grounding', 'ground', 'overwhelmed', 'grounded'];
const JOURNAL_KEYWORDS = ['journal', 'write', 'reflect', 'reflection'];
const TREND_KEYWORDS = ['trend', 'history', 'last week', 'this week', 'progress'];

const CRISIS_RESPONSE =
  "I'm really glad you're talking to me, and I want you to know that what you're feeling matters. " +
  "Please reach out to a crisis line right now — you can call or text 988 (US) or contact a trusted person near you. " +
  "You don't have to face this alone. 💙";

const BREATHING_RESPONSE =
  "Let's slow things down together. Try this: breathe in for 4 counts, hold for 4, breathe out for 6. " +
  "Repeat 3 times. You can also tap 'Breathing exercise' in Quick Actions whenever you need it.";

const GROUNDING_RESPONSE =
  "When things feel overwhelming, the 5-4-3-2-1 technique can help. " +
  "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. " +
  "Take your time. You're safe.";

const JOURNAL_PROMPTS = [
  "What's one thing that's on your mind right now?",
  "What went well today, even just a little?",
  "What is one thing you're grateful for today?",
  "Right now, I feel... (finish this sentence)",
  "What would help you feel more at ease today?",
];

const GENERIC_RESPONSES = [
  "I'm here with you. How are you feeling right now, on a scale from 1 (really rough) to 5 (pretty good)?",
  "Thanks for sharing that with me. What's been the biggest thing on your mind lately?",
  "That sounds like a lot to carry. Is there one small thing that might help you feel a little lighter today?",
  "I hear you. Sometimes just naming how we feel helps. What emotion is most present for you right now?",
  "You're doing something good by checking in with yourself. What would feel most supportive right now — talking, a breathing exercise, or a journal prompt?",
];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Returns an opening greeting from the wellness bot based on the user's latest mood.
 */
export function greetingForMood(mood?: Mood): string {
  switch (mood) {
    case 'great':
      return "You've been feeling great! 😄 I'm here if you want to talk, reflect, or just check in.";
    case 'good':
      return "Sounds like things have been going well. 🙂 What's on your mind today?";
    case 'okay':
      return "I'm here with you. Sometimes 'okay' holds a lot. What would feel most helpful right now?";
    case 'low':
      return "I see you've been having a tough time. 💙 I'm here — no pressure, just talk to me whenever you're ready.";
    case 'difficult':
      return "I'm really glad you're here. 💙 Whatever you're carrying, you don't have to face it alone. What's going on?";
    default:
      return "Hey, I'm your wellness companion. I'm here whenever you want to talk, breathe, or reflect. What's on your mind?";
  }
}

interface BotContext {
  today: DayData;
  recentCheckIns: MoodCheckIn[];
  latestInsightText?: string;
}

/**
 * Local rule-based wellness bot. No external API required.
 */
export async function sendMessageToBot(
  userText: string,
  context: BotContext,
): Promise<{ text: string; isCrisisResponse: boolean }> {
  // Simulate a short thinking delay
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));

  // Crisis check — always first
  if (containsAny(userText, CRISIS_KEYWORDS)) {
    return { text: CRISIS_RESPONSE, isCrisisResponse: true };
  }

  // Breathing / anxiety
  if (containsAny(userText, BREATHING_KEYWORDS)) {
    return { text: BREATHING_RESPONSE, isCrisisResponse: false };
  }

  // Grounding
  if (containsAny(userText, GROUNDING_KEYWORDS)) {
    return { text: GROUNDING_RESPONSE, isCrisisResponse: false };
  }

  // Journal prompt
  if (containsAny(userText, JOURNAL_KEYWORDS)) {
    const prompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    return {
      text: `Here's a prompt to get you started: "${prompt}" Take your time — your journal is private and just for you.`,
      isCrisisResponse: false,
    };
  }

  // Trend / history question
  if (containsAny(userText, TREND_KEYWORDS)) {
    const { today } = context;
    const waterStatus = today.waterMl >= today.waterGoalMl ? 'You hit your hydration goal today' : `You've had ${(today.waterMl / 1000).toFixed(1)}L of water so far`;
    const sleepStatus = today.sleepHours > 0 ? `slept ${today.sleepHours}h` : 'not logged sleep yet';
    const reply =
      `Here's a quick snapshot of today: ${waterStatus}, you've ${sleepStatus}, and you've moved ${today.exerciseMin} minutes. ` +
      (context.latestInsightText ? `One pattern I noticed: ${context.latestInsightText}` : "Keep logging and I'll spot more patterns for you.");
    return { text: reply, isCrisisResponse: false };
  }

  // Generic fallback — cycle through supportive responses
  const response = GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)];
  return { text: response, isCrisisResponse: false };
}
