import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Database,
  Server,
  ArrowRight,
  ShieldCheck,
  Code2,
  Table,
  CheckSquare
} from 'lucide-react';
import './AnalysisDoc.css';

export default function AnalysisDoc() {
  return (
    <div className="analysis-container">
      {/* Header */}
      <div className="analysis-header">
        <div className="analysis-badge-group">
          <span className="badge">Faculty Evaluation &amp; Viva Reference</span>
          <span className="practical-tag">ITUE301 • Practical 6</span>
        </div>
        <h2>Practical 6: Key Questions &amp; Conceptual Analysis</h2>
        <p>
          Full stack integration concepts: Cross-Origin Resource Sharing (CORS), state synchronization, and robust error handling across read/write operations.
        </p>
      </div>

      {/* Architecture Flow Banner */}
      <div className="arch-card">
        <h3 className="arch-title">Full Stack Communication Architecture</h3>
        <div className="arch-flow">
          <div className="arch-step">
            <span className="arch-role">React Frontend</span>
            <code>http://localhost:5173</code>
            <span className="arch-sub">UI &amp; State Management</span>
          </div>

          <div className="arch-arrow">
            <span>fetch / axios</span>
            <ArrowRight size={18} />
            <span className="cors-note">CORS Enabled</span>
          </div>

          <div className="arch-step">
            <span className="arch-role">Express Backend</span>
            <code>http://localhost:5000</code>
            <span className="arch-sub">REST API Endpoints</span>
          </div>

          <div className="arch-arrow">
            <span>Mongoose</span>
            <ArrowRight size={18} />
            <span className="cors-note">CRUD Queries</span>
          </div>

          <div className="arch-step">
            <span className="arch-role">MongoDB</span>
            <code>mongodb://localhost:27017</code>
            <span className="arch-sub">Persistent Storage</span>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="qa-grid">
        {/* Question 1 */}
        <div className="qa-card">
          <div className="qa-card-header">
            <div className="qa-icon-wrapper">
              <HelpCircle size={20} className="qa-icon" />
            </div>
            <div className="qa-header-text">
              <span className="q-number">Question 1</span>
              <h3>What changes are required on the backend (CORS) to allow the React dev server to call the Express API?</h3>
            </div>
          </div>
          <div className="qa-content">
            <p>
              Web browsers enforce the <strong>Same-Origin Policy (SOP)</strong> for security. Since the React Vite frontend runs on <code>http://localhost:5173</code> and the Express backend runs on <code>http://localhost:5000</code>, they have different ports and are treated as distinct origins.
            </p>
            <ul>
              <li>
                <strong>The Issue:</strong> Without CORS configured, the browser blocks incoming HTTP responses from the backend and logs <em>&quot;No 'Access-Control-Allow-Origin' header is present&quot;</em> in the console.
              </li>
              <li>
                <strong>Required Backend Change:</strong> Install the <code>cors</code> middleware package and enable it before registering any API routes.
              </li>
            </ul>

            <div className="code-comparison">
              <div className="code-box bad">
                <span className="code-label">❌ Without CORS (Blocked by Browser)</span>
                <pre>{`// server.js (Express)
const express = require('express');
const app = express();
app.use(express.json());

// Browser blocks fetch('http://localhost:5000/tasks') from port 5173!
app.get('/tasks', (req, res) => { ... });`}</pre>
              </div>

              <div className="code-box good">
                <span className="code-label">✅ With CORS (Configured Correctly)</span>
                <pre>{`// server.js (Express)
const express = require('express');
const cors = require('cors'); // 1. Install & import
const app = express();

app.use(cors()); // 2. Enable CORS before routes
app.use(express.json());

app.get('/tasks', (req, res) => { ... });`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Question 2 */}
        <div className="qa-card">
          <div className="qa-card-header">
            <div className="qa-icon-wrapper">
              <HelpCircle size={20} className="qa-icon" />
            </div>
            <div className="qa-header-text">
              <span className="q-number">Question 2</span>
              <h3>Why should the UI re-fetch or update local state after a successful POST/PUT/DELETE rather than assuming success silently?</h3>
            </div>
          </div>
          <div className="qa-content">
            <p>
              Assuming success silently without server confirmation leads to serious state desynchronization between client and server:
            </p>
            <div className="points-grid">
              <div className="point-box">
                <h4>1. Database-Generated Values</h4>
                <p>
                  MongoDB automatically generates properties like <code>_id</code>, <code>createdAt</code>, <code>updatedAt</code>, and applies schema default values. The client needs the server's response to get the valid database record.
                </p>
              </div>
              <div className="point-box">
                <h4>2. Avoiding Ghost / Phantom Data</h4>
                <p>
                  If an API call fails on the server (e.g. database validation error or unique constraint), assuming success displays a phantom item that disappears on page refresh.
                </p>
              </div>
              <div className="point-box">
                <h4>3. Concurrent Multi-Client Sync</h4>
                <p>
                  Re-fetching or updating state using the backend payload ensures the client UI represents the true state in MongoDB.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Question 3 */}
        <div className="qa-card">
          <div className="qa-card-header">
            <div className="qa-icon-wrapper">
              <HelpCircle size={20} className="qa-icon" />
            </div>
            <div className="qa-header-text">
              <span className="q-number">Question 3</span>
              <h3>What is the risk of not handling errors on write operations (POST/PUT/DELETE) the same way as read operations (GET)?</h3>
            </div>
          </div>
          <div className="qa-content">
            <div className="ux-impact-grid">
              <div className="ux-box without">
                <div className="ux-header">
                  <AlertCircle size={18} className="icon-bad" />
                  <h4>Risks of Unhandled Write Errors</h4>
                </div>
                <ul>
                  <li><strong>Data Drift:</strong> UI shows task as deleted or completed, but it remains unchanged in MongoDB.</li>
                  <li><strong>Broken User Trust:</strong> The user believes work is saved, closes tab, and later finds all newly created records lost.</li>
                  <li><strong>No Recovery Path:</strong> The user gets no feedback (toast or alert banner) and no opportunity to retry.</li>
                </ul>
              </div>

              <div className="ux-box with">
                <div className="ux-header">
                  <CheckCircle2 size={18} className="icon-good" />
                  <h4>With Full Write Error Handling</h4>
                </div>
                <ul>
                  <li><strong>Optimistic Rollback:</strong> If server returns 4xx/5xx, UI rolls back instantly to previous state.</li>
                  <li><strong>Actionable Feedback:</strong> Toasts clearly display the exact backend error message.</li>
                  <li><strong>Retry Option:</strong> Allows the user to re-attempt saving without losing their input.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide Table */}
        <div className="qa-card">
          <div className="qa-card-header">
            <div className="qa-icon-wrapper">
              <Table size={20} className="qa-icon" />
            </div>
            <div className="qa-header-text">
              <span className="q-number">Lab Troubleshooting Guide</span>
              <h3>Common Errors &amp; Solutions (from Lab Rubric)</h3>
            </div>
          </div>
          <div className="qa-content">
            <div className="table-responsive">
              <table className="troubleshoot-table">
                <thead>
                  <tr>
                    <th>Symptom</th>
                    <th>Likely Cause</th>
                    <th>Fix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>CORS error in browser console</strong></td>
                    <td><code>cors</code> middleware not enabled on Express server.</td>
                    <td>Run <code>npm install cors</code> and add <code>app.use(cors())</code> before route definitions.</td>
                  </tr>
                  <tr>
                    <td><strong>Fetch failed / Network Error</strong></td>
                    <td>Backend server is not running or running on wrong port.</td>
                    <td>Confirm Express server is running on port 5000 in a separate terminal (<code>node server.js</code>).</td>
                  </tr>
                  <tr>
                    <td><strong>UI shows stale data after edit/delete</strong></td>
                    <td>Local state not updated after successful API call.</td>
                    <td>Re-fetch task list or update state array from the response object after each write operation.</td>
                  </tr>
                  <tr>
                    <td><strong>Data disappears after browser refresh</strong></td>
                    <td>Still reading from local component state instead of backend.</td>
                    <td>Confirm <code>GET /tasks</code> is called on mount inside <code>useEffect</code> to populate state from MongoDB.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
