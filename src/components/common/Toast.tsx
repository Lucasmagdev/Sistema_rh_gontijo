import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent = ({ toast, onClose }: ToastProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const Icon = icons[toast.type];
  const bgColor = colors[toast.type];

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Sistema simples de toast usando estado global
let toastIdCounter = 0;
let toastListeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...currentToasts]));
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    toastListeners.push(listener);
    setToasts([...currentToasts]);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent toast={toast} onClose={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
  const id = `toast-${++toastIdCounter}`;
  const toast: Toast = { id, message, type, duration };
  currentToasts.push(toast);
  notifyListeners();
  return id;
};

