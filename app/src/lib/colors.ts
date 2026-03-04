import { useColorScheme } from 'nativewind';

/**
 * Raw hex colors for use outside className (Reanimated styles, SymbolView tintColor, etc.).
 * Maps to the same design tokens defined in global.css.
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
  foreground: '#1f2937',
  background: '#ffffff',
  card: '#f9fafb',
  cardForeground: '#1f2937',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  secondary: '#8b5cf6',
  secondaryForeground: '#ffffff',
  muted: '#f9fafb',
  mutedForeground: '#6b7280',
  accent: '#6366f1',
  accentForeground: '#ffffff',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#6366f1',
  success: '#10b981',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  activity: '#6366f1',
  activityEnd: '#818cf8',
  pause: '#8b5cf6',
  pauseEnd: '#a78bfa',
  getReady: '#f59e0b',
  getReadyEnd: '#fbbf24',
};

const dark: ColorPalette = {
  foreground: '#f9fafb',
  background: '#111827',
  card: '#1f2937',
  cardForeground: '#f9fafb',
  primary: '#818cf8',
  primaryForeground: '#ffffff',
  secondary: '#a78bfa',
  secondaryForeground: '#ffffff',
  muted: '#1f2937',
  mutedForeground: '#9ca3af',
  accent: '#818cf8',
  accentForeground: '#ffffff',
  destructive: '#f87171',
  destructiveForeground: '#ffffff',
  border: '#374151',
  input: '#374151',
  ring: '#818cf8',
  success: '#34d399',
  successForeground: '#ffffff',
  warning: '#fbbf24',
  warningForeground: '#ffffff',
  activity: '#818cf8',
  activityEnd: '#a5b4fc',
  pause: '#a78bfa',
  pauseEnd: '#c4b5fd',
  getReady: '#fbbf24',
  getReadyEnd: '#fde68a',
};

export type ThemeColors = ColorPalette;

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? dark : light;
}
