import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry, isSimulated = false }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon-wrapper">
        <AlertTriangle className="error-icon" size={18} />
      </div>
      <div className="error-content">
        <h3 className="error-title">API Request Failed</h3>
        <p className="error-message">{message || 'Unable to connect to the API server.'}</p>
        {isSimulated && (
          <p className="error-badge">
            Simulated Error Mode — the endpoint URL was modified to demonstrate error handling.
          </p>
        )}
      </div>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry} type="button">
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
