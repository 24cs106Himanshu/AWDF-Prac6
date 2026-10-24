import React, { useState } from 'react';
import { Server, Database, Terminal, Copy, Check, ExternalLink, Play } from 'lucide-react';
import './BackendGuide.css';

export default function BackendGuide() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const expressCode = `// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable CORS for React frontend (http://localhost:5173)
app.use(cors());
app.use(express.json());

// 2. MongoDB Mongoose Connection
mongoose.connect('mongodb://127.0.0.1:27017/awdf_prac6')
  .then(() => console.log('✅ Connected to MongoDB (awdf_prac6)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. Task Schema & Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// 4. API Endpoints
// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST create task
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTask = new Task({ title, description, priority, status });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE remove task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.listen(PORT, () => {
  console.log(\`🚀 Express server listening on http://localhost:\${PORT}\`);
});`;

  return (
    <div className="backend-guide">
      <div className="guide-header">
        <div className="guide-badge-group">
          <span className="badge">Practical 6 Backend Setup</span>
          <span className="practical-tag">Express + MongoDB</span>
        </div>
        <h2>Node.js &amp; Express Server Guide</h2>
        <p>
          Instructions and code required to run the Express backend on port 5000 alongside your React frontend on port 5173.
        </p>
      </div>

      {/* Steps List */}
      <div className="guide-steps">
        {/* Step 1 */}
        <div className="step-card">
          <div className="step-header">
            <span className="step-num">Step 1</span>
            <h3>Initialize and Install Backend Dependencies</h3>
          </div>
          <p>Create a backend directory and install <code>express</code>, <code>mongoose</code>, and <code>cors</code>:</p>
          <div className="terminal-box">
            <code>npm install express mongoose cors</code>
            <button
              className="copy-btn"
              onClick={() => copyToClipboard('npm install express mongoose cors', 1)}
              type="button"
            >
              {copiedIndex === 1 ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="step-card">
          <div className="step-header">
            <span className="step-num">Step 2</span>
            <h3>Create <code>server.js</code> with CORS Enabled</h3>
          </div>
          <p>This Express script handles CRUD on MongoDB with <code>cors()</code> enabled:</p>
          <div className="code-container">
            <div className="code-header-bar">
              <span>server.js (Express + Mongoose)</span>
              <button
                className="copy-btn-text"
                onClick={() => copyToClipboard(expressCode, 2)}
                type="button"
              >
                {copiedIndex === 2 ? (
                  <>
                    <Check size={13} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="code-block">{expressCode}</pre>
          </div>
        </div>

        {/* Step 3 */}
        <div className="step-card">
          <div className="step-header">
            <span className="step-num">Step 3</span>
            <h3>Run Frontend and Backend Simultaneously</h3>
          </div>
          <p>Demonstrate running both dev servers in separate terminal tabs as specified in 6.pdf:</p>
          <div className="two-terminals">
            <div className="term-box">
              <span className="term-title">Terminal 1 (Backend on 5000)</span>
              <code>node server/server.js</code>
            </div>
            <div className="term-box">
              <span className="term-title">Terminal 2 (React on 5173)</span>
              <code>npm run dev</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
