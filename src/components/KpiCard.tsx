import type { MetricItem } from '../data/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  metric?: MetricItem;
  isLoading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ metric, isLoading }) => {
  if (isLoading || !metric) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      </div>
    );
  }

  const isPositive = metric.change > 0;
  const isNeutral = metric.change === 0;

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {metric.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            isNeutral
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              : isPositive
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
          }`}
        >
          {isNeutral ? (
            <Minus className="w-3 h-3" />
          ) : isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {metric.change > 0 ? `+${metric.change}%` : `${metric.change}%`}
        </span>
      </div>

      <div className="my-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {metric.formattedValue}
        </div>
      </div>

      <div className="text-xs text-slate-400">
        {metric.timeframe}
      </div>
    </div>
  );
};
