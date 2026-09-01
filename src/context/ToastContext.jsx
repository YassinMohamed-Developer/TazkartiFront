import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration !== undefined ? options.duration : 4500;
    const title = options.title || null;

    setToasts((prev) => {
      // Remove any existing toast with the same id to avoid duplicates
      const filtered = prev.filter((t) => t.id !== id);
      return [...filtered, { id, message, type, title, duration }];
    });

    return id;
  }, []);

  const toast = {
    show: showToast,
    success: (msg, opts) => showToast(msg, 'success', opts),
    error: (msg, opts) => showToast(msg, 'error', opts),
    warning: (msg, opts) => showToast(msg, 'warning', opts),
    info: (msg, opts) => showToast(msg, 'info', opts),
    dismiss: dismissToast,
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100%-2.5rem)] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (toast.duration <= 0 || isPaused) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const config = {
    warning: {
      border: 'border-status-warning/40',
      bg: 'bg-surface-container-lowest/95 dark:bg-surface-container-lowest/95',
      icon: 'warning',
      iconColor: 'text-golden-gate',
      iconBg: 'bg-golden-gate/10',
      progressBar: 'bg-golden-gate',
      badge: 'Attention',
    },
    error: {
      border: 'border-primary/40',
      bg: 'bg-surface-container-lowest/95 dark:bg-surface-container-lowest/95',
      icon: 'error',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      progressBar: 'bg-primary',
      badge: 'Notice',
    },
    success: {
      border: 'border-pitch-green/40',
      bg: 'bg-surface-container-lowest/95 dark:bg-surface-container-lowest/95',
      icon: 'check_circle',
      iconColor: 'text-pitch-green',
      iconBg: 'bg-pitch-green/10',
      progressBar: 'bg-pitch-green',
      badge: 'Success',
    },
    info: {
      border: 'border-tertiary/40',
      bg: 'bg-surface-container-lowest/95 dark:bg-surface-container-lowest/95',
      icon: 'info',
      iconColor: 'text-tertiary',
      iconBg: 'bg-tertiary/10',
      progressBar: 'bg-tertiary',
      badge: 'Information',
    },
  }[toast.type] || {
    border: 'border-outline-variant',
    bg: 'bg-surface-container-lowest/95',
    icon: 'info',
    iconColor: 'text-secondary',
    iconBg: 'bg-surface-container',
    progressBar: 'bg-secondary',
    badge: 'Notification',
  };

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} shadow-2xl backdrop-blur-xl p-4 transition-all duration-300 animate-toast-in`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
          <span className={`material-symbols-outlined ${config.iconColor} text-xl fill`}>
            {config.icon}
          </span>
        </div>

        <div className="flex-grow min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.iconBg} ${config.iconColor}`}>
              {toast.title || config.badge}
            </span>
          </div>
          <p className="text-sm font-semibold text-on-surface leading-snug">
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 p-1 text-secondary hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-container-high overflow-hidden">
          <div
            className={`h-full ${config.progressBar} transition-all`}
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastContext;
