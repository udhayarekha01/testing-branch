import React from 'react';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import type { Task } from '../types/task';

interface TaskMetricsProps {
  tasks: Task[];
}

export const TaskMetrics: React.FC<TaskMetricsProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const pending = tasks.filter(t => t.status === 'todo').length;

  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const overdue = tasks.filter(
    t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr
  ).length;

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">{completionRate}% done</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <ListTodo className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Progress</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600">{inProgress}</span>
            <span className="text-xs text-slate-500">{pending} queued</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600">{completed}</span>
            <span className="text-xs text-emerald-600 font-medium">+{completed}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold ${overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdue}
            </span>
            <span className="text-xs text-slate-500">{overdue > 0 ? 'Requires attention' : 'All on track'}</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          overdue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
        }`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
