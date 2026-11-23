import type { SeriesPoint } from '../data/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Activity } from 'lucide-react';

interface LineChartWidgetProps {
  data: SeriesPoint[];
  isLoading?: boolean;
}

export const LineChartWidget: React.FC<LineChartWidgetProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-center items-center animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-48 bg-slate-100 rounded w-full"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No chart data available</h4>
        <p className="text-xs text-slate-400 mt-1">Try adjusting the filter criteria</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Revenue & Active Users Trend</h3>
          <p className="text-xs text-slate-500">Timeline performance overview</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">
          {data.length} periods
        </span>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={d => {
                const parts = d.split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
              }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={val => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `$${Number(value ?? 0).toLocaleString()}` : Number(value ?? 0).toLocaleString(),
                name === 'revenue' ? 'Revenue' : 'Active Users'
              ]}
              labelFormatter={label => `Date: ${label}`}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activeUsers"
              name="activeUsers"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
