import { useColorScheme } from 'nativewind';

/**
 * Raw hex colors for use outside className (Reanimated styles, SymbolView tintColor, etc.).
 * Maps to the same design tokens defined in global.css.
 *
 * Palette: warm stone neutrals + teal primary + amber secondary.
 */

type ColorPalette = {
  foreground: string;
  background: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  activity: string;
  activityEnd: string;
  pause: string;
  pauseEnd: string;
  getReady: string;
  getReadyEnd: string;
};

const light: ColorPalette = {
  foreground: '#1c1917',    // stone-900
  background: '#fafaf9',    // stone-50
  card: '#f5f5f4',          // stone-100
  cardForeground: '#1c1917',
  primary: '#0d9488',       // teal-600
  primaryForeground: '#ffffff',
  secondary: '#f59e0b',     // amber-500
  secondaryForeground: '#ffffff',
  muted: '#f5f5f4',
  mutedForeground: '#78716c', // stone-500
  accent: '#0d9488',
  accentForeground: '#ffffff',
  destructive: '#dc2626',   // red-600
  destructiveForeground: '#ffffff',
  border: '#e7e5e4',        // stone-200
  input: '#e7e5e4',
  ring: '#0d9488',
  success: '#16a34a',       // green-600
  successForeground: '#ffffff',
  warning: '#d97706',       // amber-600
  warningForeground: '#ffffff',
  activity: '#0d9488',      // teal-600
  activityEnd: '#14b8a6',   // teal-500
  pause: '#8b5cf6',         // violet-500
  pauseEnd: '#a78bfa',      // violet-400
  getReady: '#f59e0b',      // amber-500
  getReadyEnd: '#fbbf24',   // amber-400
};

const dark: ColorPalette = {
  foreground: '#fafaf9',    // stone-50
  background: '#1c1917',    // stone-900
  card: '#292524',          // stone-800
  cardForeground: '#fafaf9',
  primary: '#2dd4bf',       // teal-400
  primaryForeground: '#1c1917',
  secondary: '#fbbf24',     // amber-400
  secondaryForeground: '#1c1917',
  muted: '#292524',
  mutedForeground: '#a8a29e', // stone-400
  accent: '#2dd4bf',
  accentForeground: '#1c1917',
  destructive: '#f87171',   // red-400
  destructiveForeground: '#ffffff',
  border: '#44403c',        // stone-700
  input: '#44403c',
  ring: '#2dd4bf',
  success: '#4ade80',       // green-400
  successForeground: '#1c1917',
  warning: '#fbbf24',       // amber-400
  warningForeground: '#1c1917',
  activity: '#2dd4bf',      // teal-400
  activityEnd: '#5eead4',   // teal-300
  pause: '#a78bfa',         // violet-400
  pauseEnd: '#c4b5fd',      // violet-300
  getReady: '#fbbf24',      // amber-400
  getReadyEnd: '#fde68a',   // amber-200
};

export type ThemeColors = ColorPalette;

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? dark : light;
}
