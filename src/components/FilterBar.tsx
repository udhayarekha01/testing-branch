import type { Filters } from '../data/types';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters | ((prev: Filters) => Filters)) => void;
  onReset: () => void;
  categories: string[];
  regions: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  categories,
  regions
}) => {
  const isFiltered = Boolean(
    filters.startDate ||
    filters.endDate ||
    (filters.category && filters.category !== 'all') ||
    (filters.region && filters.region !== 'all') ||
    filters.search
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by ID, channel..."
            value={filters.search || ''}
            onChange={e => onChange(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.category || 'all'}
              onChange={e => onChange(prev => ({ ...prev, category: e.target.value }))}
              className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={filters.region || 'all'}
              onChange={e => onChange(prev => ({ ...prev, region: e.target.value }))}
              className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Regions</option>
              {regions.map(reg => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={e => onChange(prev => ({ ...prev, startDate: e.target.value }))}
              className="text-xs bg-transparent border-0 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="Start Date"
            />
            <span className="text-slate-300 dark:text-slate-600 text-xs">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={e => onChange(prev => ({ ...prev, endDate: e.target.value }))}
              className="text-xs bg-transparent border-0 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="End Date"
            />
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
