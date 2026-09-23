'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration ?? 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = {
    default: Info,
    success: CheckCircle,
    destructive: AlertCircle,
    info: Info,
  }[toast.variant ?? 'default'];

  return (
    <div
      role="alert"
      className={cn(
        'animate-in bg-background pointer-events-auto flex w-[360px] items-start gap-3 rounded-lg border p-4 shadow-lg',
        toast.variant === 'destructive' && 'border-destructive/50 text-destructive',
        toast.variant === 'success' && 'border-success/50'
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          toast.variant === 'success' && 'text-success',
          toast.variant === 'destructive' && 'text-destructive',
          toast.variant === 'info' && 'text-info',
          !toast.variant && 'text-foreground'
        )}
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-muted-foreground text-sm">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground rounded-sm p-0.5"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
