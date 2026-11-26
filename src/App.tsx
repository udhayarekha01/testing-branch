import { useState, useMemo, useCallback } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskMetrics } from './components/TaskMetrics';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { Task, TaskFilterOptions, Status, Priority, Category } from './types/task';
import {
  CheckSquare,
  Plus,
  Trash2,
  RotateCcw,
  ListFilter,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Other'];

export function App() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    clearCompleted,
    resetToDefaults
  } = useTasks();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [filters, setFilters] = useState<TaskFilterOptions>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    sortBy: 'createdDesc'
  });

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
      search: '',
      sortBy: 'createdDesc'
    });
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleModalSubmit = (data: {
    title: string;
    description?: string;
    priority: Priority;
    category: Category;
    status: Status;
    dueDate?: string;
  }) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      addToast('success', `Updated task "${data.title}"`);
    } else {
      addTask(data);
      addToast('success', `Created task "${data.title}"`);
    }
  };

  const handleToggleStatus = (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    toggleTaskStatus(id);
    const willBeCompleted = target.status !== 'completed';
    addToast(
      'info',
      willBeCompleted ? `Marked "${target.title}" as completed!` : `Reopened "${target.title}"`
    );
  };

  const handleStatusChange = (id: string, status: Status) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    updateTask(id, { status });
    addToast('info', `Moved "${target.title}" to ${status.replace('_', ' ')}`);
  };

  const handleDelete = (id: string) => {
    const target = tasks.find(t => t.id === id);
    deleteTask(id);
    if (target) {
      addToast('info', `Deleted task "${target.title}"`);
    }
  };

  const handleClearCompleted = () => {
    const count = tasks.filter(t => t.status === 'completed').length;
    if (count === 0) return;
    clearCompleted();
    addToast('info', `Cleared ${count} completed task${count > 1 ? 's' : ''}`);
  };

  const handleResetSampleData = () => {
    resetToDefaults();
    addToast('info', 'Reset tasks to default sample data');
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    const searchLower = filters.search.trim().toLowerCase();

    const result = tasks.filter(task => {
      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      // Category filter
      if (filters.category !== 'all' && task.category !== filters.category) {
        return false;
      }
      // Search filter
      if (searchLower) {
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower) || false;
        if (!titleMatch && !descMatch) return false;
      }
      return true;
    });

    const priorityRank: Record<Priority, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    return result.sort((a, b) => {
      if (filters.sortBy === 'dueDateAsc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (filters.sortBy === 'dueDateDesc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      }
      if (filters.sortBy === 'priorityDesc') {
        const diff = priorityRank[b.priority] - priorityRank[a.priority];
        if (diff !== 0) return diff;
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (filters.sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      // default: createdDesc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filters]);

  const completedCount = useMemo(() => {
    return tasks.filter(t => t.status === 'completed').length;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Simple Task Tracker
              </h1>
              <p className="text-xs text-slate-500">
                Organize, track, and complete tasks effortlessly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSampleData}
              title="Reset to default tasks"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-sm shadow-indigo-200 hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* KPI & Metrics Bar */}
        <TaskMetrics tasks={tasks} />

        {/* Filters and search */}
        <TaskFilterBar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          categories={CATEGORIES}
        />

        {/* Task List Header Actions */}
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5" />
            <span>
              Showing <strong className="text-slate-800">{filteredTasks.length}</strong> of{' '}
              <strong className="text-slate-800">{tasks.length}</strong> tasks
            </span>
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear completed ({completedCount})</span>
            </button>
          )}
        </div>

        {/* Tasks List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={handleToggleStatus}
                onStatusChange={handleStatusChange}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No tasks found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
                ? 'Try adjusting your filters or search query to find what you are looking for.'
                : 'You have no tasks in your list. Get started by creating your first task!'}
            </p>
            {filters.search || filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all' ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Add Your First Task
              </button>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        initialTask={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
