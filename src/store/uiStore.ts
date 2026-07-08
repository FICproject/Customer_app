import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
}));
