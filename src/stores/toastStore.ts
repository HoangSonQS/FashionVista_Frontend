import { create } from 'zustand';
import type { ToastData, ToastAction, ToastType } from '../components/common/Toast';

interface ToastState {
  toasts: ToastData[];
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: ToastAction
  ) => string;
  removeToast: (id: string) => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, type = 'info', duration = 4000, action) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    const newToast: ToastData = { id, message, type, duration, action };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
