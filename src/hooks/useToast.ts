import { useState, useCallback } from 'react';
import type { ToastType } from '../components/common/Toast';

interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
};


