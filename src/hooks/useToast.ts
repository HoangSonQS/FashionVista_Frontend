import { useState, useCallback } from 'react';
import type { ToastType, ToastData, ToastAction } from '../components/common/Toast';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration = 4000,
      action?: ToastAction,
    ) => {
      const id = `toast-${++toastIdCounter}-${Date.now()}`;
      const newToast: ToastData = { id, message, type, duration, action };

      setToasts((prev) => [...prev, newToast]);

      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
};


