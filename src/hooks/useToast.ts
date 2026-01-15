import { useToastStore } from '../stores/toastStore';

export const useToast = () => {
  const toasts = useToastStore((state) => state.toasts);
  const showToast = useToastStore((state) => state.showToast);
  const removeToast = useToastStore((state) => state.removeToast);

  return { toasts, showToast, removeToast };
};



