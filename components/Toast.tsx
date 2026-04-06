import React from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast, ToastType } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-indigo-600 text-white',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 duration-200 pointer-events-auto ${styles[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm font-bold flex-1">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
