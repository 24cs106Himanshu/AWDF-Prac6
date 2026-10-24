import React from 'react';
import { Loader2 } from 'lucide-react';
import './Spinner.css';

export default function Spinner({ message = 'Fetching repositories from GitHub API…' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <Loader2 className="spinner-icon spinning" size={28} />
      <p className="spinner-text">{message}</p>
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
