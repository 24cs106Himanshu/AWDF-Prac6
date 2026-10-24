import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Edit3,
  RefreshCw,
  AlertTriangle,
  Server,
  Filter,
  Check,
  X,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';
import * as api from '../api';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import './TaskManager.css';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [dataSource, setDataSource] = useState('backend'); // 'backend' or 'local'
  const [isBackendLive, setIsBackendLive] = useState(true);

  // Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editStatus, setEditStatus] = useState('pending');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete State & Modal
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message, duration: 4000 }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async (isManualRefresh = false) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      if (simulateError) {
        throw new Error('Simulated Network Error: Failed to fetch tasks from http://localhost:5000/tasks.');
      }

      // Attempt live backend fetch
      const result = await api.getTasks(controller.signal);
      setTasks(result.tasks);
      setDataSource('backend');
      setIsBackendLive(true);
      if (isManualRefresh) {
        addToast('success', 'Refreshed', 'Tasks reloaded from MongoDB backend.');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;

      console.warn('Backend fetch failed, falling back to local demo storage:', err.message);
      setIsBackendLive(false);

      if (simulateError) {
        setError(err.message);
        setTasks([]);
      } else {
        // Graceful fallback to local mock API for smooth demo / Viva presentation
        const localResult = await api.localApi.getTasks();
        setTasks(localResult.tasks);
        setDataSource('local');
        if (isManualRefresh) {
          addToast('info', 'Demo Mode', 'Loaded tasks from local storage (Express backend on :5000 is offline).');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [simulateError, addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task (with Optimistic UI Update)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('error', 'Validation Error', 'Task title cannot be empty.');
      return;
    }

    const tempId = 'temp-' + Date.now();
    const taskPayload = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update: Insert temporary task immediately
    const optimisticTask = { _id: tempId, ...taskPayload, _isOptimistic: true };
    setTasks((prev) => [optimisticTask, ...prev]);
    setIsSubmitting(true);

    try {
      let created;
      if (simulateError) {
        throw new Error('Simulated POST Error: Server failed to save new task.');
      }

      if (isBackendLive) {
        try {
          created = await api.createTask(taskPayload);
          setDataSource('backend');
        } catch (apiErr) {
          // If backend refused, fallback to local
          created = await api.localApi.createTask(taskPayload);
          setDataSource('local');
          setIsBackendLive(false);
        }
      } else {
        created = await api.localApi.createTask(taskPayload);
      }

      // Replace optimistic placeholder with real confirmed data
      setTasks((prev) =>
        prev.map((t) => (t._id === tempId ? (created.task || created) : t))
      );

      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setIsCreateOpen(false);
      addToast('success', 'Task Created', `"${taskPayload.title}" was saved successfully.`);
    } catch (err) {
      // Rollback optimistic update on error
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      addToast('error', 'Create Failed', err.message || 'Could not create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Task Status (Quick action)
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    const taskId = task._id || task.id;

    // Optimistic status update
    setTasks((prev) =>
      prev.map((t) =>
        (t._id || t.id) === taskId ? { ...t, status: nextStatus } : t
      )
    );

    try {
      if (simulateError) {
        throw new Error('Simulated PUT Error: Server failed to update task status.');
      }

      if (isBackendLive) {
        try {
          await api.updateTask(taskId, { status: nextStatus });
        } catch {
          await api.localApi.updateTask(taskId, { status: nextStatus });
        }
      } else {
        await api.localApi.updateTask(taskId, { status: nextStatus });
      }

      addToast(
        'info',
        'Status Updated',
        `Task marked as ${nextStatus === 'completed' ? 'Completed' : 'Pending'}.`
      );
    } catch (err) {
      // Rollback on failure
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId ? { ...t, status: task.status } : t
        )
      );
      addToast('error', 'Update Failed', err.message || 'Status change could not be saved.');
    }
  };

  // Open Edit Modal
  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditStatus(task.status || 'pending');
  };

  // Save Edit Task
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) {
      addToast('error', 'Validation Error', 'Title cannot be empty.');
      return;
    }

    const taskId = editingTask._id || editingTask.id;
    const updatePayload = {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      status: editStatus
    };

    setIsUpdating(true);

    try {
      if (simulateError) {
        throw new Error('Simulated PUT Error: Failed to save edits.');
      }

      let updated;
      if (isBackendLive) {
        try {
          updated = await api.updateTask(taskId, updatePayload);
        } catch {
          updated = await api.localApi.updateTask(taskId, updatePayload);
        }
      } else {
        updated = await api.localApi.updateTask(taskId, updatePayload);
      }

      const finalUpdatedTask = updated.task || updated;
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === taskId ? { ...t, ...finalUpdatedTask } : t))
      );

      setEditingTask(null);
      addToast('success', 'Task Updated', 'Changes were persisted successfully.');
    } catch (err) {
      addToast('error', 'Update Failed', err.message || 'Failed to save changes.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Prompt Delete Confirmation Modal
  const promptDelete = (task) => {
    setTaskToDelete(task);
    setDeletingTaskId(task._id || task.id);
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;

    setIsDeleting(true);
    const id = deletingTaskId;
    const previousTasks = [...tasks];

    // Optimistic removal from state
    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));

    try {
      if (simulateError) {
        throw new Error('Simulated DELETE Error: Backend rejected delete request.');
      }

      if (isBackendLive) {
        try {
          await api.deleteTask(id);
        } catch {
          await api.localApi.deleteTask(id);
        }
      } else {
        await api.localApi.deleteTask(id);
      }

      addToast('success', 'Task Deleted', 'The task has been permanently removed.');
      setDeletingTaskId(null);
      setTaskToDelete(null);
    } catch (err) {
      // Rollback on failure
      setTasks(previousTasks);
      addToast('error', 'Delete Failed', err.message || 'Could not delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'completed'
        ? task.status === 'completed'
        : task.status === 'pending';

    const matchesSearch =
      !searchQuery.trim() ||
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="task-manager">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Delete Confirmation Modal (Supplementary requirement) */}
      <ConfirmModal
        isOpen={Boolean(deletingTaskId)}
        title="Delete Task"
        message={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`
            : 'Are you sure you want to delete this task?'
        }
        confirmText="Yes, Delete Task"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeletingTaskId(null);
          setTaskToDelete(null);
        }}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => !isUpdating && setEditingTask(null)}>
          <div className="modal-card edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-wrapper info">
                <Edit3 size={18} />
              </div>
              <div className="modal-header-text">
                <h3 className="modal-title">Edit Task</h3>
                <p className="modal-subtitle">PUT /tasks/:id</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setEditingTask(null)}
                disabled={isUpdating}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body form-body">
                <div className="form-group">
                  <label htmlFor="edit-title">Task Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    className="form-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-desc">Description (Optional)</label>
                  <textarea
                    id="edit-desc"
                    className="form-textarea"
                    rows="3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-priority">Priority</label>
                    <select
                      id="edit-priority"
                      className="form-select"
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-status">Status</label>
                    <select
                      id="edit-status"
                      className="form-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingTask(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating || !editTitle.trim()}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header & Status Indicator */}
      <div className="tm-header">
        <div className="tm-header-left">
          <div className="tm-badge-group">
            <span className="practical-pill">Practical 6</span>
            <span className={`status-pill ${isBackendLive ? 'backend-active' : 'local-active'}`}>
              <Database size={12} />
              {isBackendLive ? 'Express Server (Port 5000)' : 'Local Storage Fallback'}
            </span>
          </div>
          <h1 className="tm-title">Full Stack Task Management</h1>
          <p className="tm-subtitle">
            React frontend connected with Node.js, Express &amp; MongoDB CRUD API.
          </p>
        </div>

        <div className="tm-header-actions">
          <button
            className={`btn btn-outline ${simulateError ? 'active-error-btn' : ''}`}
            onClick={() => setSimulateError((s) => !s)}
            type="button"
            title="Simulates network/API error for Practical verification"
          >
            <AlertTriangle size={14} />
            <span>{simulateError ? 'Simulating Error ⚠️' : 'Simulate Error'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => fetchTasks(true)}
            disabled={loading}
            type="button"
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setIsCreateOpen((v) => !v)}
            type="button"
          >
            <Plus size={15} />
            <span>{isCreateOpen ? 'Hide Form' : 'New Task'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon total">
            <Layers size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{totalCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completedCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Task Creation Form (Collapsible Card) */}
      {isCreateOpen && (
        <section className="create-card" aria-label="Create Task Form">
          <div className="create-header">
            <div className="create-title-wrapper">
              <Sparkles size={16} className="create-sparkle" />
              <h3>Add New Task to Database</h3>
            </div>
            <span className="api-tag">POST /tasks</span>
          </div>

          <form onSubmit={handleCreateTask} className="create-form">
            <div className="form-group">
              <label htmlFor="task-title">Task Title *</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="e.g. Implement User Authentication"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-description">Description (Optional)</label>
              <textarea
                id="task-description"
                className="form-textarea"
                rows="2"
                placeholder="Provide brief notes, context, or requirements..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div className="create-actions">
              <div className="priority-picker">
                <label htmlFor="task-priority">Priority:</label>
                <select
                  id="task-priority"
                  className="form-select-sm"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="create-btn-group">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting || !newTitle.trim()}
                >
                  {isSubmitting ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Search & Filter Toolbar */}
      <div className="toolbar-row">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-field"
            placeholder="Search tasks by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-pills" role="tablist">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            type="button"
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
            type="button"
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
            type="button"
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Error Message with Retry */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => fetchTasks(true)}
          isSimulated={simulateError}
        />
      )}

      {/* Loading Spinner */}
      {loading && tasks.length === 0 && <Spinner message="Connecting to backend & loading tasks..." />}

      {/* Task List */}
      <div className="task-list">
        {!loading && filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-box">
              <Filter size={24} />
            </div>
            <h4>No tasks found</h4>
            <p>
              {searchQuery || activeFilter !== 'all'
                ? 'Try adjusting your search query or filter criteria.'
                : 'Get started by creating your first task using the "+ New Task" button above.'}
            </p>
            {!isCreateOpen && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsCreateOpen(true)}
                type="button"
              >
                <Plus size={14} /> Add First Task
              </button>
            )}
          </div>
        )}

        {filteredTasks.map((task) => {
          const taskId = task._id || task.id;
          const isCompleted = task.status === 'completed';
          const priority = task.priority || 'medium';

          return (
            <div
              key={taskId}
              className={`task-card ${isCompleted ? 'task-done' : ''} ${
                task._isOptimistic ? 'task-optimistic' : ''
              }`}
            >
              {/* Checkbox toggle */}
              <button
                className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
                onClick={() => handleToggleStatus(task)}
                aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                type="button"
                title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              >
                {isCompleted && <Check size={14} />}
              </button>

              {/* Task Details */}
              <div className="task-content">
                <div className="task-title-row">
                  <span className="task-title">{task.title}</span>
                  <div className="task-badges">
                    <span className={`priority-tag priority-${priority}`}>
                      {priority}
                    </span>
                    <span className={`status-tag status-${task.status || 'pending'}`}>
                      {task.status || 'pending'}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-footer">
                  <span className="task-date">
                    {task.createdAt
                      ? `Added: ${new Date(task.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}`
                      : 'Saved in Database'}
                  </span>
                  {task._isOptimistic && (
                    <span className="syncing-tag">Syncing with MongoDB...</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="task-actions">
                <button
                  className="action-icon-btn edit-btn"
                  onClick={() => openEditModal(task)}
                  aria-label="Edit task"
                  title="Edit task"
                  type="button"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  className="action-icon-btn delete-btn"
                  onClick={() => promptDelete(task)}
                  aria-label="Delete task"
                  title="Delete task"
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
