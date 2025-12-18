import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
  action?: ToastAction;
}

const Toast = ({ id, message, type = 'info', duration = 4000, onClose, action }: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        // Nền xanh nhạt, chữ tối để đọc rõ
        return 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success-foreground)]';
      case 'error':
        // Nền đỏ nhạt, chữ tối để đọc rõ
        return 'bg-[var(--error-bg)] border-[var(--error)] text-[var(--error-foreground)]';
      case 'warning':
        // Nền vàng nhạt, chữ tối để đọc rõ
        return 'bg-[var(--warning-bg)] border-[var(--warning)] text-[var(--warning-foreground)]';
      default:
        // Info: nền card trắng, chữ tối
        return 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]';
    }
  };

  const handleActionClick = () => {
    if (action) {
      action.onClick();
      onClose(id);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-[300px] max-w-[400px] animate-in slide-in-from-right-full ${getStyles()}`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <button
            type="button"
            onClick={handleActionClick}
            className="mt-2 text-xs font-semibold underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded p-1 hover:opacity-70 transition-opacity"
        aria-label="Đóng"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export interface ToastData {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  const containerContent = (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            action={toast.action}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );

  return createPortal(containerContent, document.body);
};

