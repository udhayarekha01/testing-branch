import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Trash2,
  AlertCircle
} from 'lucide-react';
import type { Task, Status } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_BADGES = {
  high: { label: 'High', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  medium: { label: 'Medium', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Low', bg: 'bg-slate-100 text-slate-700 border-slate-200' }
};

const CATEGORY_COLORS: Record<string, string> = {
  Work: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Personal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Study: 'bg-purple-50 text-purple-700 border-purple-200',
  Health: 'bg-pink-50 text-pink-700 border-pink-200',
  Finance: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const isCompleted = task.status === 'completed';
  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    task.dueDate < todayStr;

  const categoryStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other;
  const priorityStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

  return (
    <div
      className={`group bg-white rounded-xl border transition-all duration-200 p-4 ${
        isCompleted
          ? 'border-slate-200/60 bg-slate-50/50'
          : isOverdue
          ? 'border-rose-200 hover:border-rose-300 shadow-2xs'
          : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Toggle completion checkbox button */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-hidden transition-colors cursor-pointer shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-base font-semibold leading-snug break-words ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </span>

            {/* Badges */}
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${priorityStyle.bg}`}
            >
              {priorityStyle.label}
            </span>

            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${categoryStyle}`}
            >
              {task.category}
            </span>

            {/* Status pill */}
            <select
              value={task.status}
              onChange={e => onStatusChange(task.id, e.target.value as Status)}
              aria-label="Task Status"
              className={`text-xs font-medium rounded-lg px-2 py-0.5 border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
                task.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : task.status === 'in_progress'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {task.description && (
            <p
              className={`text-xs mt-1 leading-relaxed ${
                isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
            {task.dueDate && (
              <div
                className={`flex items-center gap-1.5 ${
                  isOverdue ? 'text-rose-600 font-medium' : ''
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Due {task.dueDate}</span>
                {isOverdue && <span className="text-[10px] uppercase tracking-wider">(Overdue)</span>}
              </div>
            )}

            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Added {new Date(task.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick action buttons / menu */}
        <div className="relative shrink-0 flex items-center gap-1" ref={menuRef}>
          <button
            type="button"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label="Edit task"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label="Delete task"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
