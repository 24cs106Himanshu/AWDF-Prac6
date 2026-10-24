const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/awdf_prac6';

// 1. Enable CORS for React frontend (http://localhost:5173)
app.use(cors());
app.use(express.json());

// 2. Task Schema & Mongoose Model
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

const Task = mongoose.model('Task', taskSchema);

// Initial starter tasks for practical 6
const INITIAL_TASKS = [
  {
    title: 'Configure CORS on Express Server',
    description: 'Install cors package and enable app.use(cors()) before route definitions.',
    status: 'completed',
    priority: 'high'
  },
  {
    title: 'Create central api.js helper file',
    description: 'Define getTasks, createTask, updateTask, and deleteTask functions with BASE_URL.',
    status: 'completed',
    priority: 'high'
  },
  {
    title: 'Connect Task UI to MongoDB Database',
    description: 'Replace GitHub fetch logic with live REST API calls to http://localhost:5000/tasks.',
    status: 'pending',
    priority: 'medium'
  },
  {
    title: 'Implement Delete Confirmation Dialog & Toasts',
    description: 'Add modal confirmation before deletion and toast notifications for CRUD actions.',
    status: 'pending',
    priority: 'low'
  }
];

// 3. Connect to MongoDB and seed database if empty
async function initializeDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Connected to MongoDB database: ${MONGO_URI}`);

    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany(INITIAL_TASKS);
      console.log('🌱 Successfully initialized & seeded `awdf_prac6` database with initial tasks.');
    } else {
      console.log(`📦 Database 'awdf_prac6' already contains ${count} tasks.`);
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

initializeDatabase();

// 4. REST API Routes
// GET /tasks - Retrieve all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tasks', details: err.message });
  }
});

// POST /tasks - Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      status: status || 'pending'
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

// PUT /tasks/:id - Update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

// DELETE /tasks/:id - Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Practical 6 Express server running at http://localhost:${PORT}`);
});
