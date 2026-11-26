import { useState, useEffect } from 'react';
import type { Task, Status, Priority, Category } from '../types/task';

const STORAGE_KEY = 'task_tracker_tasks_v1';

const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Q3 roadmap review',
    description: 'Review product objectives, team assignments, and milestones with team leads.',
    status: 'in_progress',
    priority: 'high',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'task-2',
    title: 'Prepare design assets for landing page',
    description: 'Export SVG icons, responsive banners, and color palletes.',
    status: 'todo',
    priority: 'medium',
    category: 'Work',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'task-3',
    title: 'Weekly grocery run and meal prep',
    description: 'Stock up on fresh produce, oatmeal, and prep lunches for Mon-Thu.',
    status: 'completed',
    priority: 'low',
    category: 'Personal',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-4',
    title: 'Complete TypeScript advanced generics module',
    description: 'Solve exercises on conditional types and mapped utility types.',
    status: 'in_progress',
    priority: 'high',
    category: 'Study',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'task-5',
    title: 'Schedule dentist checkup',
    description: 'Annual dental hygiene and checkup appointment.',
    status: 'todo',
    priority: 'medium',
    category: 'Health',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((t: Task) => ({
            ...t,
            priority: VALID_PRIORITIES.includes(t.priority) ? t.priority : 'medium'
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }, [tasks]);

  const addTask = (data: {
    title: string;
    description?: string;
    priority: Priority;
    category: Category;
    dueDate?: string;
    status?: Status;
  }) => {
    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      priority: data.priority,
      category: data.category,
      status: data.status || 'todo',
      dueDate: data.dueDate || undefined,
      createdAt: new Date().toISOString(),
      completedAt: data.status === 'completed' ? new Date().toISOString() : undefined
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const updatedStatus = updates.status !== undefined ? updates.status : t.status;
        const completedAt =
          updatedStatus === 'completed'
            ? t.status !== 'completed'
              ? new Date().toISOString()
              : t.completedAt
            : undefined;

        return {
          ...t,
          ...updates,
          completedAt
        };
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const nextStatus: Status =
          t.status === 'completed' ? 'todo' : 'completed';
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
        };
      })
    );
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
  };

  const resetToDefaults = () => {
    setTasks(INITIAL_TASKS);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    clearCompleted,
    resetToDefaults
  };
}
