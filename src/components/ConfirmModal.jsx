import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = true,
  isLoading = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={!isLoading ? onCancel : undefined}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className={`modal-icon-wrapper ${isDangerous ? 'danger' : 'info'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="modal-header-text">
            <h3 id="modal-title" className="modal-title">
              {title}
            </h3>
            <p className="modal-subtitle">Practical 6 Confirmation Dialog</p>
          </div>
          {!isLoading && (
            <button
              className="modal-close-btn"
              onClick={onCancel}
              aria-label="Close dialog"
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="modal-body">
          <p className="modal-message">{message}</p>
          <div className="modal-note">
            <span>⚠️ This operation will make an API call to MongoDB to permanently remove this record.</span>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
