import React from 'react';
import { Sparkles, CheckSquare } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="portfolio-header">
      <div className="header-inner">
        <div className="header-left">
          <div className="logo-badge" aria-hidden="true">
            <CheckSquare size={18} className="logo-icon" />
          </div>
          <div className="header-text">
            <h1 className="header-title">AWDF Practical 6</h1>
            <p className="header-tagline">Full Stack Integration (React + Express + MongoDB)</p>
          </div>
        </div>

        <div className="header-right">
          <span className="practical-tag">Task Dashboard</span>
        </div>
      </div>
    </header>
  );
}
