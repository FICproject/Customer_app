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
  primary: '#F5B800',
  background: '#FFF8E8',
  secondary: '#101827',
  grayDark: '#FFF1C7',
  grayLight: '#64748B',
  cardBg: '#FFFFFF',
  cardBorder: '#F1EAD8',
  text: '#101827',
};





const getThemeColors = (mode: ThemeMode) => {
  if (mode === 'system') {
    const isDark = Appearance.getColorScheme() === 'dark';
    return isDark ? darkColors : lightColors;
  }
  return mode === 'dark' ? darkColors : lightColors;
};

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'light', // default to white/light theme
  colors: lightColors,
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
