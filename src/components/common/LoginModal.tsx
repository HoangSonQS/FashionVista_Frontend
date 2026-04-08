import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const LoginModal = ({ isOpen, onClose, message = 'Bạn cần đăng nhập để tiếp tục.' }: LoginModalProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm bg-[var(--card)] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Authentication Required</h3>
        <p className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)] mb-8">{message}</p>
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-sm border border-[var(--border)] text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 rounded-sm bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[var(--primary-hover)] transition-all"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

