import {
    CaffeineSource,
    DayData,
    ExerciseType,
    Insight,
    JournalEntry,
    Mood,
    MOOD_META,
    MoodCheckIn,
    RecoverySuggestion,
    WellnessData
} from '@/models/types';
import { daysAgoISO, todayISO } from '@/utils/dateUtils';
import React, { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';

// ─── Caffeine amounts per source (mg) ─────────────────────────────────────────
const CAFFEINE_MG: Record<CaffeineSource, number> = {
  coffee: 95,
  tea: 47,
  energy_drink: 160,
  soda: 40,
};

// ─── Seed data helpers ────────────────────────────────────────────────────────
function emptyDay(dateISO: string): DayData {
  return {
    dateISO,
    waterMl: 0,
    waterGoalMl: 2500,
    caffeineMg: 0,
    sleepHours: 0,
    sleepQuality: 0,
    exerciseMin: 0,
    moodScore: null,
    stressScore: null,
    energyScore: null,
    journaled: false,
  };
}

function makeSeedHistory(): DayData[] {
  return Array.from({ length: 6 }, (_, i) => {
    const day = emptyDay(daysAgoISO(6 - i));
    day.waterMl = 1800 + Math.round(Math.random() * 900);
    day.sleepHours = parseFloat((6 + Math.random() * 2.5).toFixed(1));
    day.sleepQuality = Math.ceil(Math.random() * 5);
    day.exerciseMin = Math.round(Math.random() * 40);
    day.caffeineMg = Math.round(Math.random() * 300);
    day.moodScore = parseFloat((2 + Math.random() * 3).toFixed(1));
    day.stressScore = Math.ceil(Math.random() * 5);
    day.energyScore = Math.ceil(Math.random() * 5);
    day.journaled = Math.random() > 0.5;
    return day;
  });
}

// ─── State shape ──────────────────────────────────────────────────────────────
interface WellnessState {
  today: DayData;
  history: DayData[]; // last 6 days, not including today
  moodCheckIns: MoodCheckIn[];
  journalEntries: JournalEntry[];
}

function initialState(): WellnessState {
  return {
    today: emptyDay(todayISO()),
    history: makeSeedHistory(),
    moodCheckIns: [],
    journalEntries: [],
  };
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'LOG_WATER'; ml: number }
  | { type: 'SET_WATER_GOAL'; ml: number }
  | { type: 'LOG_CAFFEINE'; source: CaffeineSource }
  | { type: 'LOG_SLEEP'; hours: number; quality: number }
  | { type: 'LOG_EXERCISE'; exerciseType: ExerciseType; minutes: number }
  | { type: 'LOG_MOOD'; mood: Mood; score: number; note?: string }
  | { type: 'ADD_JOURNAL'; entry: Omit<JournalEntry, 'id' | 'timestamp'> }
  | { type: 'UPDATE_JOURNAL'; id: string; patch: Partial<Omit<JournalEntry, 'id' | 'timestamp'>> }
  | { type: 'DELETE_JOURNAL'; id: string };

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function reducer(state: WellnessState, action: Action): WellnessState {
  switch (action.type) {
    case 'LOG_WATER':
      return { ...state, today: { ...state.today, waterMl: state.today.waterMl + action.ml } };

    case 'SET_WATER_GOAL':
      return { ...state, today: { ...state.today, waterGoalMl: action.ml } };

    case 'LOG_CAFFEINE':
      return {
        ...state,
        today: { ...state.today, caffeineMg: state.today.caffeineMg + CAFFEINE_MG[action.source] },
      };

    case 'LOG_SLEEP':
      return {
        ...state,
        today: { ...state.today, sleepHours: action.hours, sleepQuality: action.quality },
      };

    case 'LOG_EXERCISE':
      return {
        ...state,
        today: { ...state.today, exerciseMin: state.today.exerciseMin + action.minutes },
      };

    case 'LOG_MOOD': {
      const checkIn: MoodCheckIn = {
        id: genId(),
        timestamp: Date.now(),
        mood: action.mood,
        score: action.score,
        note: action.note,
      };
      const allCheckIns = [...state.moodCheckIns, checkIn];
      // Recalculate today's average mood score
      const todayCheckIns = allCheckIns.filter(
        (c) => new Date(c.timestamp).toISOString().split('T')[0] === todayISO(),
      );
      const avgMood =
        todayCheckIns.reduce((acc, c) => acc + c.score, 0) / todayCheckIns.length;
      return {
        ...state,
        moodCheckIns: allCheckIns,
        today: { ...state.today, moodScore: parseFloat(avgMood.toFixed(2)) },
      };
    }

    case 'ADD_JOURNAL': {
      const entry: JournalEntry = {
        ...action.entry,
        id: genId(),
        timestamp: Date.now(),
      };
      return {
        ...state,
        journalEntries: [entry, ...state.journalEntries],
        today: { ...state.today, journaled: true },
      };
    }

    case 'UPDATE_JOURNAL':
      return {
        ...state,
        journalEntries: state.journalEntries.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e,
        ),
      };

    case 'DELETE_JOURNAL':
      return {
        ...state,
        journalEntries: state.journalEntries.filter((e) => e.id !== action.id),
      };

    default:
      return state;
  }
}

// ─── Derived data helpers ─────────────────────────────────────────────────────
function computeInsights(state: WellnessState): Insight[] {
  const insights: Insight[] = [];
  const { today } = state;

  if (today.sleepHours > 0 && today.sleepHours < 6) {
    insights.push({
      id: 'sleep-low',
      kind: 'pattern',
      text: "You slept less than 6 hours last night. Rest is key to recovery — try to aim for 7-9 hours tonight.",
    });
  }
  if (today.waterMl < today.waterGoalMl * 0.5 && new Date().getHours() > 14) {
    insights.push({
      id: 'water-low',
      kind: 'suggestion',
      text: "You've had less than half your water goal today. Staying hydrated supports focus and mood.",
    });
  }
  if (today.caffeineMg > 300) {
    insights.push({
      id: 'caffeine-high',
      kind: 'pattern',
      text: "Your caffeine intake today is higher than usual. This might affect your sleep quality tonight.",
    });
  }
  if (today.exerciseMin === 0 && new Date().getHours() > 16) {
    insights.push({
      id: 'exercise-none',
      kind: 'suggestion',
      text: "No movement logged today. Even a 10-minute walk can boost your mood and energy.",
    });
  }
  if (insights.length === 0) {
    insights.push({
      id: 'general-good',
      kind: 'trend',
      text: "You're doing well today! Keep tracking to uncover personal patterns over the next few days.",
    });
  }
  return insights;
}

function computeRecoverySuggestions(state: WellnessState): RecoverySuggestion[] {
  const suggestions: RecoverySuggestion[] = [];
  const { today } = state;

  if (today.stressScore != null && today.stressScore >= 4) {
    suggestions.push({
      id: 'breathing-stress',
      category: 'breathing',
      text: 'Try a 4-4-6 breathing reset',
      reason: "Your stress is elevated — a few slow breaths can help bring it down.",
    });
  }
  if (today.waterMl < today.waterGoalMl * 0.6) {
    suggestions.push({
      id: 'water-drink',
      category: 'water',
      text: 'Drink a glass of water',
      reason: "Hydration supports focus and can reduce fatigue.",
    });
  }
  if (today.exerciseMin < 10) {
    suggestions.push({
      id: 'movement-walk',
      category: 'movement',
      text: 'Take a 10-minute walk',
      reason: "Light movement improves circulation and can lift your mood.",
    });
  }
  suggestions.push({
    id: 'journal-reflect',
    category: 'journaling',
    text: 'Write for 5 minutes',
    reason: "Reflecting on your day helps process emotions and spot patterns.",
  });
  return suggestions.slice(0, 3);
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface WellnessContextValue {
  data: WellnessData;
  fullHistory: DayData[];
  insights: Insight[];
  recoverySuggestions: RecoverySuggestion[];
  latestCheckIn: MoodCheckIn | undefined;
  deviceConnected: boolean;
  devicePermissionStatus: 'not_requested' | 'granted' | 'denied';
  connectedDeviceType: 'smartwatch' | 'fitness_band' | 'health_monitor' | 'manual';
  connectWearable: (deviceType?: 'smartwatch' | 'fitness_band' | 'health_monitor' | 'manual') => void;
  disconnectWearable: () => void;
  logWater: (ml: number) => void;
  setWaterGoal: (ml: number) => void;
  logCaffeine: (source: CaffeineSource) => void;
  logSleep: (hours: number, quality: number) => void;
  logExercise: (exerciseType: ExerciseType, minutes: number) => void;
  logMoodCheckIn: (mood: Mood, note?: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  updateJournalEntry: (id: string, patch: Partial<Omit<JournalEntry, 'id' | 'timestamp'>>) => void;
  deleteJournalEntry: (id: string) => void;
}

const WellnessContext = createContext<WellnessContextValue | undefined>(undefined);

export const WellnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [devicePermissionStatus, setDevicePermissionStatus] = useState<'not_requested' | 'granted' | 'denied'>('not_requested');
  const [connectedDeviceType, setConnectedDeviceType] = useState<'smartwatch' | 'fitness_band' | 'health_monitor' | 'manual'>('manual');

  const connectWearable = useCallback(
    (deviceType: 'smartwatch' | 'fitness_band' | 'health_monitor' | 'manual' = 'smartwatch') => {
      setConnectedDeviceType(deviceType);
      setDevicePermissionStatus('granted');
      setDeviceConnected(true);
    },
    [],
  );

  const disconnectWearable = useCallback(() => {
    setDeviceConnected(false);
    setDevicePermissionStatus('denied');
    setConnectedDeviceType('manual');
  }, []);

  const logWater = useCallback((ml: number) => dispatch({ type: 'LOG_WATER', ml }), []);
  const setWaterGoal = useCallback((ml: number) => dispatch({ type: 'SET_WATER_GOAL', ml }), []);
  const logCaffeine = useCallback(
    (source: CaffeineSource) => dispatch({ type: 'LOG_CAFFEINE', source }),
    [],
  );
  const logSleep = useCallback(
    (hours: number, quality: number) => dispatch({ type: 'LOG_SLEEP', hours, quality }),
    [],
  );
  const logExercise = useCallback(
    (exerciseType: ExerciseType, minutes: number) =>
      dispatch({ type: 'LOG_EXERCISE', exerciseType, minutes }),
    [],
  );
  const logMoodCheckIn = useCallback((mood: Mood, note?: string) => {
    const score = MOOD_META[mood].score;
    dispatch({ type: 'LOG_MOOD', mood, score, note });
  }, []);
  const addJournalEntry = useCallback(
    (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => dispatch({ type: 'ADD_JOURNAL', entry }),
    [],
  );
  const updateJournalEntry = useCallback(
    (id: string, patch: Partial<Omit<JournalEntry, 'id' | 'timestamp'>>) =>
      dispatch({ type: 'UPDATE_JOURNAL', id, patch }),
    [],
  );
  const deleteJournalEntry = useCallback(
    (id: string) => dispatch({ type: 'DELETE_JOURNAL', id }),
    [],
  );

  const value = useMemo<WellnessContextValue>(() => {
    const data: WellnessData = {
      today: state.today,
      moodCheckIns: state.moodCheckIns,
      journalEntries: state.journalEntries,
    };
    const fullHistory = [...state.history, state.today];
    const insights = computeInsights(state);
    const recoverySuggestions = computeRecoverySuggestions(state);
    const latestCheckIn = state.moodCheckIns[state.moodCheckIns.length - 1];
    return {
      data,
      fullHistory,
      insights,
      recoverySuggestions,
      latestCheckIn,
      deviceConnected,
      devicePermissionStatus,
      connectedDeviceType,
      connectWearable,
      disconnectWearable,
      logWater,
      setWaterGoal,
      logCaffeine,
      logSleep,
      logExercise,
      logMoodCheckIn,
      addJournalEntry,
      updateJournalEntry,
      deleteJournalEntry,
    };
  }, [
    state,
    deviceConnected,
    devicePermissionStatus,
    connectedDeviceType,
    connectWearable,
    disconnectWearable,
    logWater,
    setWaterGoal,
    logCaffeine,
    logSleep,
    logExercise,
    logMoodCheckIn,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
  ]);

  return <WellnessContext.Provider value={value}>{children}</WellnessContext.Provider>;
};

export function useWellness(): WellnessContextValue {
  const ctx = useContext(WellnessContext);
  if (!ctx) throw new Error('useWellness must be used within a WellnessProvider');
  return ctx;
}
