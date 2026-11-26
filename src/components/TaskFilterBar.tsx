import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { TaskFilterOptions, Status, Priority, SortOption } from '../types/task';

interface TaskFilterBarProps {
  filters: TaskFilterOptions;
  onChange: (filters: TaskFilterOptions) => void;
  onReset: () => void;
  categories: string[];
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  categories
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 space-y-3">
      {/* Search Input & Quick Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filters.sortBy}
            onChange={e => onChange({ ...filters, sortBy: e.target.value as SortOption })}
            aria-label="Sort tasks"
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="createdDesc">Newest Created</option>
            <option value="dueDateAsc">Due Date (Earliest First)</option>
            <option value="dueDateDesc">Due Date (Latest First)</option>
            <option value="priorityDesc">Priority (High to Low)</option>
            <option value="titleAsc">Title (A - Z)</option>
          </select>

          <button
            onClick={onReset}
            title="Reset all filters"
            className="px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          {(['all', 'todo', 'in_progress', 'completed'] as const).map(status => {
            const labelMap: Record<string, string> = {
              all: 'All Status',
              todo: 'To Do',
              in_progress: 'In Progress',
              completed: 'Completed'
            };
            const active = filters.status === status;
            return (
              <button
                key={status}
                onClick={() => onChange({ ...filters, status: status as 'all' | Status })}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {labelMap[status]}
              </button>
            );
          })}
        </div>

        {/* Priority dropdown */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="font-medium text-slate-400">Priority:</span>
          <select
            value={filters.priority}
            onChange={e => onChange({ ...filters, priority: e.target.value as 'all' | Priority })}
            aria-label="Filter by priority"
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Category dropdown */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="font-medium text-slate-400">Category:</span>
          <select
            value={filters.category}
            onChange={e => onChange({ ...filters, category: e.target.value })}
            aria-label="Filter by category"
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
