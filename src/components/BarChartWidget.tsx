import { useMemo } from 'react';
import type { TableRow } from '../data/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';
import { BarChart2 } from 'lucide-react';

interface BarChartWidgetProps {
  rows: TableRow[];
  isLoading?: boolean;
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({ rows, isLoading }) => {
  const chart = useChartTheme();
  const categoryData = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const map = new Map<string, { category: string; revenue: number; transactions: number }>();
    rows.forEach(r => {
      if (!map.has(r.category)) {
        map.set(r.category, { category: r.category, revenue: 0, transactions: 0 });
      }
      const entry = map.get(r.category)!;
      entry.revenue += r.revenue;
      entry.transactions += r.transactions;
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [rows]);

  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-center items-center animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <BarChart2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">No category data available</h4>
        <p className="text-xs text-slate-400 mt-1">Try expanding your filter range</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Revenue by Category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across business sectors</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
            <XAxis
              dataKey="category"
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
              tickFormatter={val => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chart.tooltip.backgroundColor,
                border: chart.tooltip.border,
                color: chart.tooltip.color,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={chart.bars[index % chart.bars.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
