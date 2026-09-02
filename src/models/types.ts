// ─── User & Auth ──────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ─── Wearable Device Data ────────────────────────────────────────────────────
export interface WearableDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_band' | 'health_monitor' | 'manual';
  lastSync: number;
}

export interface DeviceReading {
  id: string;
  deviceId: string;
  timestamp: number;
  heartRate?: number;
  hrv?: number;
  sleepHours?: number;
  sleepQuality?: number;
  steps?: number;
  calories?: number;
}

export interface NSRIDeviceData {
  heartRate: number | null;
  hrv: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  lastReadingTime: number | null;
}

// ─── Mood ──────────────────────────────────────────────────────────────────────
export type Mood = 'great' | 'good' | 'okay' | 'low' | 'difficult';

export const MOOD_META: Record<Mood, { emoji: string; score: number; label: string }> = {
  great:     { emoji: '😄', score: 5,   label: 'Great' },
  good:      { emoji: '🙂', score: 4,   label: 'Good' },
  okay:      { emoji: '😐', score: 3,   label: 'Okay' },
  low:       { emoji: '😔', score: 2,   label: 'Low' },
  difficult: { emoji: '😢', score: 1,   label: 'Difficult' },
};

// ─── Journal ───────────────────────────────────────────────────────────────────
export type JournalTag =
  | 'Work'
  | 'Sleep'
  | 'Relationships'
  | 'Stress'
  | 'Personal'
  | 'Gratitude'
  | 'Other';

export interface JournalEntry {
  id: string;
  timestamp: number;
  content: string;
  prompt?: string;
  moodBefore?: Mood;
  moodAfter?: Mood;
  tags: JournalTag[];
}

// ─── Trackers ──────────────────────────────────────────────────────────────────
export type CaffeineSource = 'coffee' | 'tea' | 'energy_drink' | 'soda';

export type ExerciseType =
  | 'walking'
  | 'stretching'
  | 'running'
  | 'yoga'
  | 'gym'
  | 'other';

// ─── Check-ins ─────────────────────────────────────────────────────────────────
export interface MoodCheckIn {
  id: string;
  timestamp: number;
  mood: Mood;
  /** Optional numeric score 1-5 */
  score: number;
  note?: string;
}

// ─── Day snapshot ──────────────────────────────────────────────────────────────
export interface DayData {
  /** ISO date string, e.g. "2026-09-01" */
  dateISO: string;
  waterMl: number;
  waterGoalMl: number;
  caffeineMg: number;
  sleepHours: number;
  /** 1-5 subjective rating */
  sleepQuality: number;
  exerciseMin: number;
  /** 1-5 average from check-ins today */
  moodScore: number | null;
  /** 1-5 */
  stressScore: number | null;
  /** 1-5 */
  energyScore: number | null;
  journaled: boolean;
}

// ─── App-level wellness state ──────────────────────────────────────────────────
export interface WellnessData {
  today: DayData;
  moodCheckIns: MoodCheckIn[];
  journalEntries: JournalEntry[];
}

// ─── Insights ──────────────────────────────────────────────────────────────────
export type InsightKind = 'pattern' | 'trend' | 'suggestion';

export interface Insight {
  id: string;
  kind: InsightKind;
  text: string;
}

// ─── Recovery suggestions ──────────────────────────────────────────────────────
export type RecoveryCategory =
  | 'breathing'
  | 'grounding'
  | 'water'
  | 'movement'
  | 'rest'
  | 'screen_break'
  | 'social'
  | 'mindful_pause'
  | 'sleep'
  | 'journaling';

export interface RecoverySuggestion {
  id: string;
  category: RecoveryCategory;
  text: string;
  reason: string;
}

// ─── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
  isCrisisResponse?: boolean;
}

// ─── Weekly trends ─────────────────────────────────────────────────────────────
export type MetricKey =
  | 'mood'
  | 'stress'
  | 'energy'
  | 'sleep'
  | 'water'
  | 'caffeine'
  | 'exercise'
  | 'nsri';
