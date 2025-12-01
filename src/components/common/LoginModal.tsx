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
        className="w-full max-w-md rounded-2xl bg-[var(--card)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-2">Đăng nhập yêu cầu</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

