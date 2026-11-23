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
import { BarChart2 } from 'lucide-react';

interface BarChartWidgetProps {
  rows: TableRow[];
  isLoading?: boolean;
}

const COLORS = ['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({ rows, isLoading }) => {
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
      <div className="h-full bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-center items-center animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-48 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="h-full bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No category data available</h4>
        <p className="text-xs text-slate-400 mt-1">Try expanding your filter range</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Revenue by Category</h3>
          <p className="text-xs text-slate-500">Distribution across business sectors</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="category"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={val => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
