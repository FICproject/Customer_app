import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: {
    primary: string;
    background: string;
    secondary: string;
    grayDark: string;
    grayLight: string;
    cardBg: string;
    cardBorder: string;
    text: string;
  };
}

const darkColors = {
  primary: '#F4C400',
  background: '#050B1E',
  secondary: '#FFFFFF',
  grayDark: '#0D1636',
  grayLight: 'rgba(255, 255, 255, 0.4)',
  cardBg: 'rgba(13, 22, 54, 0.65)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
};

const lightColors = {
  primary: '#D97706',
  background: '#F8FAFC',
  secondary: '#0F172A',
  grayDark: '#F1F5F9',
  grayLight: '#64748B',
  cardBg: 'rgba(255, 255, 255, 0.85)',
  cardBorder: 'rgba(15, 23, 42, 0.08)',
  text: '#0F172A',
};

const getThemeColors = (mode: ThemeMode) => {
  if (mode === 'system') {
    const isDark = Appearance.getColorScheme() === 'dark';
    return isDark ? darkColors : lightColors;
  }
  return mode === 'dark' ? darkColors : lightColors;
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'dark', // default to dark
  colors: darkColors,
  setThemeMode: (mode) => {
    set({
      themeMode: mode,
      colors: getThemeColors(mode),
    });
  },
}));

// Set up an appearance change listener to automatically toggle system colors
Appearance.addChangeListener(() => {
  const currentMode = useThemeStore.getState().themeMode;
  if (currentMode === 'system') {
    useThemeStore.setState({ colors: getThemeColors('system') });
  }
});
