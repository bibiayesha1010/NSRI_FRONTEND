import { TextStyle, ViewStyle } from 'react-native';

// ─── Colour palette ────────────────────────────────────────────────────────────
export const colors = {
  // Brand
  primary: '#4F86C6',
  primaryDark: '#2D5F96',
  primarySoft: '#E8F0FB',

  secondary: '#7B68EE',
  secondarySoft: '#EEE9FF',

  // Semantic
  accent: '#F5A623',
  attention: '#E67E22',
  low: '#E74C3C',
  lowSoft: '#FDECEA',

  // Domain
  water: '#3498DB',
  waterSoft: '#EAF4FD',
  caffeine: '#A0522D',
  caffeineSoft: '#FDF3EE',
  exercise: '#27AE60',
  exerciseSoft: '#EAFAF1',

  // Neutrals
  background: '#F7F7F5',
  card: '#FFFFFF',
  cardMuted: '#F2F2EF',
  border: '#E8E8E4',

  // Text
  text: '#2C2C2A',
  textMuted: '#8A8A80',
  textInverse: '#FFFFFF',
} as const;

// ─── Spacing ───────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ─── Border radius ─────────────────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

// ─── Typography ────────────────────────────────────────────────────────────────
export const typography = {
  h1: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } as TextStyle,
  h2: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,
  bodyMedium: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  } as TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,
  tiny: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
} as const;

// ─── Shadow ────────────────────────────────────────────────────────────────────
export const shadowStyle: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 3,
};
