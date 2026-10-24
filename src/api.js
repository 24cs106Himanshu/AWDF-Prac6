/**
 * Central API Client for Practical 6: Full Stack Integration
 * BASE_URL points to Express backend (default: http://localhost:5000)
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LOCAL_STORAGE_KEY = 'awdf_prac6_tasks_backup';

// Initial sample data if offline / local storage is empty
const INITIAL_DEMO_TASKS = [
  {
    _id: 'task-1',
    title: 'Configure CORS on Express Server',
    description: 'Install cors package and enable app.use(cors()) before route definitions.',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: 'task-2',
    title: 'Create central api.js helper file',
    description: 'Define getTasks, createTask, updateTask, and deleteTask functions.',
    status: 'completed',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'task-3',
    title: 'Connect Task UI to MongoDB Backend',
    description: 'Replace GitHub fetch logic with live calls to http://localhost:5000/tasks.',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'task-4',
    title: 'Implement Delete Confirmation Dialog & Toast',
    description: 'Ensure user confirms task deletion and shows success/error toasts.',
    status: 'pending',
    priority: 'low',
    createdAt: new Date().toISOString()
  }
];

// Helper to get local tasks
function getLocalTasks() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_TASKS;
  }
}

// Helper to save local tasks
function saveLocalTasks(tasks) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

/**
 * Fetch all tasks (GET /tasks)
 */
export async function getTasks(signal) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    signal,
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to fetch tasks (HTTP ${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const tasks = Array.isArray(data) ? data : data.tasks || [];
  saveLocalTasks(tasks);
  return { tasks, source: 'backend' };
}

/**
 * Create a new task (POST /tasks)
 */
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to create task (HTTP ${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing task (PUT /tasks/:id)
 */
export async function updateTask(id, updateData) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to update task (HTTP ${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a task (DELETE /tasks/:id)
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to delete task (HTTP ${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Offline / Local fallback helpers for demo mode when Express backend is not running
 */
export const localApi = {
  getTasks: async () => {
    await new Promise((r) => setTimeout(r, 250));
    return { tasks: getLocalTasks(), source: 'local' };
  },
  createTask: async (taskData) => {
    await new Promise((r) => setTimeout(r, 300));
    const tasks = getLocalTasks();
    const newTask = {
      _id: 'task-' + Date.now(),
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString()
    };
    const updated = [newTask, ...tasks];
    saveLocalTasks(updated);
    return newTask;
  },
  updateTask: async (id, updateData) => {
    await new Promise((r) => setTimeout(r, 250));
    const tasks = getLocalTasks();
    let updatedTask = null;
    const updated = tasks.map((t) => {
      if ((t._id || t.id) === id) {
        updatedTask = { ...t, ...updateData, updatedAt: new Date().toISOString() };
        return updatedTask;
      }
      return t;
    });
    saveLocalTasks(updated);
    return updatedTask || { _id: id, ...updateData };
  },
  deleteTask: async (id) => {
    await new Promise((r) => setTimeout(r, 250));
    const tasks = getLocalTasks();
    const updated = tasks.filter((t) => (t._id || t.id) !== id);
    saveLocalTasks(updated);
    return { success: true, message: 'Task deleted locally' };
  },
  resetDemoTasks: () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
    return INITIAL_DEMO_TASKS;
  }
};

export { BASE_URL };
