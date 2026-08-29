import { create } from 'zustand';

export interface LanguageOption {
  code: string;
  name: string;
}

export const LANGUAGES_LIST: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
];

interface LanguageState {
  currentLanguage: string;
  setLanguage: (langName: string) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: 'English',
  setLanguage: (langName: string) => set({ currentLanguage: langName }),
}));
