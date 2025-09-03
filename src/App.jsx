
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('Medium');
  const [dueDateInput, setDueDateInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedDarkMode = localStorage.getItem('darkMode');
    
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing stored tasks:', error);
        localStorage.removeItem('tasks');
      }
    }
    
    if (storedDarkMode) {
      try {
        setDarkMode(JSON.parse(storedDarkMode));
      } catch (error) {
        console.error('Error parsing stored dark mode:', error);
        localStorage.removeItem('darkMode');
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save tasks to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // Save dark mode preference
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode, isLoaded]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editId) {
        cancelEdit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editId]);

  // Toast functions
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newTask = {
      id: Date.now(),
      title: input.trim(),
      note: noteInput.trim(),
      completed: false,
      priority: priorityInput,
      dueDate: dueDateInput,
      createdAt: new Date().toISOString()
    };
    
    setTasks([newTask, ...tasks]);
    setInput('');
    setNoteInput('');
    setPriorityInput('Medium');
    setDueDateInput('');
    addToast('Task created successfully! 🎉', 'success');
  };

  const deleteTask = (id) => {
    if (showConfirmDelete === id) {
      setTasks(tasks.filter(t => t.id !== id));
      setShowConfirmDelete(null);
      addToast('Task deleted successfully! 🗑️', 'info');
    } else {
      setShowConfirmDelete(id);
      setTimeout(() => setShowConfirmDelete(null), 3000); // Auto-hide after 3s
    }
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
    
    if (task && !task.completed) {
      addToast('Task completed! Well done! ✅', 'success');
    } else {
      addToast('Task marked as pending 📝', 'info');
    }
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditData({
      title: task.title,
      note: task.note,
      priority: task.priority,
      dueDate: task.dueDate
    });
  };

  const saveEdit = (id) => {
    if (!editData.title?.trim()) return;
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, ...editData, title: editData.title.trim() } : t
    ));
    setEditId(null);
    setEditData({});
    addToast('Task updated successfully! ✏️', 'success');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.note.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'Active') return !task.completed && matchesSearch;
    if (filter === 'Completed') return task.completed && matchesSearch;
    return matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      {!isLoaded ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your tasks...</p>
        </div>
      ) : (
        <div className="todo-container">
          {/* Header with Dark Mode Toggle */}
          <div className="header">
            <h1>✨ Todo Master</h1>
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Add Task Form */}
          <form onSubmit={addTask} className="todo-form">
            <div className="form-row">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="What needs to be done?"
                className="task-input"
                required
              />
              <button type="submit" className="add-btn">Add Task</button>
            </div>
            
            <div className="form-row secondary">
              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add a note (optional)"
                className="note-input"
              />
              <select
                value={priorityInput}
                onChange={e => setPriorityInput(e.target.value)}
                className="priority-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <input
                type="date"
                value={dueDateInput}
                onChange={e => setDueDateInput(e.target.value)}
                className="date-input"
              />
            </div>
          </form>

          {/* Search and Filter */}
          <div className="controls">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="🔍 Search tasks..."
              className="search-input"
            />
            
            <div className="filter-tabs">
              {['All', 'Active', 'Completed'].map(filterType => (
                <button
                  key={filterType}
                  className={`filter-tab ${filter === filterType ? 'active' : ''}`}
                  onClick={() => setFilter(filterType)}
                >
                  {filterType} 
                  <span className="count">
                    {filterType === 'All' ? taskCounts.all : 
                     filterType === 'Active' ? taskCounts.active : taskCounts.completed}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="todo-list">
            <AnimatePresence>
              {filteredTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="empty-state"
                >
                  <div className="empty-icon">📝</div>
                  <h3>No tasks found</h3>
                  <p>{searchTerm ? 'Try a different search term' : 'Add your first task above'}</p>
                </motion.div>
              ) : (
                filteredTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
                  >
                    {editId === task.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editData.title || ''}
                          onChange={e => setEditData({...editData, title: e.target.value})}
                          className="edit-title-input"
                          autoFocus
                        />
                        <textarea
                          value={editData.note || ''}
                          onChange={e => setEditData({...editData, note: e.target.value})}
                          placeholder="Add a note..."
                          className="edit-note-input"
                          rows="2"
                        />
                        <div className="edit-controls">
                          <select
                            value={editData.priority || 'Medium'}
                            onChange={e => setEditData({...editData, priority: e.target.value})}
                            className="edit-priority-select"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                          <input
                            type="date"
                            value={editData.dueDate || ''}
                            onChange={e => setEditData({...editData, dueDate: e.target.value})}
                            className="edit-date-input"
                          />
                        </div>
                        <div className="edit-actions">
                          <button onClick={() => saveEdit(task.id)} className="save-btn">Save</button>
                          <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="task-content">
                        <div className="task-main">
                          <label className="checkbox-container">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleComplete(task.id)}
                              className="task-checkbox"
                            />
                            <span className="checkmark"></span>
                          </label>
                          
                          <div className="task-info">
                            <div className="task-title">{task.title}</div>
                            {task.note && (
                              <div className="task-note">📝 {task.note}</div>
                            )}
                            
                            <div className="task-meta">
                              <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`status-badge ${task.completed ? 'completed' : 'pending'}`}>
                                {task.completed ? '✅ Completed' : '⏳ Pending'}
                              </span>
                              {task.dueDate && (
                                <span className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                                  📅 {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="task-actions">
                          <button 
                            onClick={() => startEdit(task)} 
                            className="action-btn edit-btn"
                            title="Edit task"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)} 
                            className={`action-btn delete-btn ${showConfirmDelete === task.id ? 'confirm' : ''}`}
                            title={showConfirmDelete === task.id ? 'Click again to confirm' : 'Delete task'}
                          >
                            {showConfirmDelete === task.id ? '⚠️' : '🗑️'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className={`toast toast-${toast.type}`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
