import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  actionText?: string;
  onAction?: () => void;
  showToast: (message: string, actionText?: string, onAction?: () => void) => void;
  hideToast: () => void;
}

let autoHideTimer: any = null;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  actionText: undefined,
  onAction: undefined,
  showToast: (message, actionText, onAction) => {
    if (autoHideTimer) clearTimeout(autoHideTimer);
    set({
      visible: true,
      message,
      actionText,
      onAction,
    });

    autoHideTimer = setTimeout(() => {
      set({ visible: false });
    }, 3200);
  },
  hideToast: () => {
    if (autoHideTimer) clearTimeout(autoHideTimer);
    set({ visible: false });
  },
}));
