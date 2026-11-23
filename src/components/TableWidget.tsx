import React, { useState, useMemo } from 'react';
import type { TableRow } from '../data/types';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface TableWidgetProps {
  rows: TableRow[];
  isLoading?: boolean;
}

type SortField = keyof TableRow;
type SortOrder = 'asc' | 'desc';

export const TableWidget: React.FC<TableWidgetProps> = ({ rows, isLoading }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const sortedRows = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-2 flex-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <Inbox className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">No records found</h4>
        <p className="text-xs text-slate-400 mt-1">No transaction matches the current filters.</p>
      </div>
    );
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 inline ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 inline ml-1" />
    );
  };

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Detailed Transaction Records</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Showing {sortedRows.length} total transactions</p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                ID {renderSortIcon('id')}
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Date {renderSortIcon('date')}
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Category {renderSortIcon('category')}
              </th>
              <th
                onClick={() => handleSort('region')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Region {renderSortIcon('region')}
              </th>
              <th
                onClick={() => handleSort('transactions')}
                className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Orders {renderSortIcon('transactions')}
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Revenue {renderSortIcon('revenue')}
              </th>
              <th
                onClick={() => handleSort('satisfaction')}
                className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Score {renderSortIcon('satisfaction')}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
              >
                Status {renderSortIcon('status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{row.id}</td>
                <td className="px-4 py-2.5">{row.date}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-2.5">{row.region}</td>
                <td className="px-4 py-2.5 text-right font-medium">{row.transactions}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                  ${row.revenue.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className="text-amber-600 dark:text-amber-400 font-medium">★ {row.satisfaction}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      row.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : row.status === 'Pending'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing {paginatedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} entries
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
