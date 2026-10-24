import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon-success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon-error" />;
      case 'info':
      default:
        return <Info size={18} className="toast-icon-info" />;
    }
  };

  return (
    <div className={`toast-item toast-${toast.type || 'info'}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        {toast.title && <h4 className="toast-title">{toast.title}</h4>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
        type="button"
      >
        <X size={15} />
      </button>
    </div>
  );
}
