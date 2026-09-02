import { TextStyle, ViewStyle } from 'react-native';

const lightPalette = {
  primary: '#4F86C6',
  primaryDark: '#2D5F96',
  primarySoft: '#E8F0FB',

  secondary: '#7B68EE',
  secondarySoft: '#EEE9FF',

  accent: '#F5A623',
  attention: '#E67E22',
  low: '#E74C3C',
  lowSoft: '#FDECEA',

  water: '#3498DB',
  waterSoft: '#EAF4FD',
  caffeine: '#A0522D',
  caffeineSoft: '#FDF3EE',
  exercise: '#27AE60',
  exerciseSoft: '#EAFAF1',

  background: '#F7F7F5',
  card: '#FFFFFF',
  cardMuted: '#F2F2EF',
  border: '#E8E8E4',

  text: '#2C2C2A',
  textMuted: '#8A8A80',
  textInverse: '#FFFFFF',
} as const;

const darkPalette = {
  primary: '#8AB7E8',
  primaryDark: '#B8D4F7',
  primarySoft: '#1F2A38',

  secondary: '#9C8BFF',
  secondarySoft: '#2C2745',

  accent: '#FFBF5F',
  attention: '#F0A868',
  low: '#FF7B72',
  lowSoft: '#3C2224',

  water: '#5BB8FF',
  waterSoft: '#142B3A',
  caffeine: '#D9A176',
  caffeineSoft: '#352C27',
  exercise: '#5ED28B',
  exerciseSoft: '#173426',

  background: '#111827',
  card: '#1A2333',
  cardMuted: '#212C3D',
  border: '#2D3A4F',

  text: '#F5F7FA',
  textMuted: '#A5B0C3',
  textInverse: '#111827',
} as const;

export const colors: typeof lightPalette = { ...lightPalette };

export const applyThemeMode = (isDark: boolean) => {
  const nextTheme = isDark ? darkPalette : lightPalette;
  Object.keys(colors).forEach((key) => {
    const themeKey = key as keyof typeof colors;
    const colorValue = nextTheme[themeKey];
    if (colorValue) {
      (colors as Record<string, string>)[themeKey] = colorValue;
    }
  });
};

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
