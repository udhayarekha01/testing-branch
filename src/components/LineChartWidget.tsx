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
import { useChartTheme } from '../hooks/useChartTheme';
import { Activity } from 'lucide-react';

interface LineChartWidgetProps {
  data: SeriesPoint[];
  isLoading?: boolean;
}

export const LineChartWidget: React.FC<LineChartWidgetProps> = ({ data, isLoading }) => {
  const chart = useChartTheme();
  if (isLoading) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-center items-center animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">No chart data available</h4>
        <p className="text-xs text-slate-400 mt-1">Try adjusting the filter criteria</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Revenue & Active Users Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Timeline performance overview</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-md">
          {data.length} periods
        </span>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
            <XAxis
              dataKey="date"
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
              tickFormatter={d => {
                const parts = d.split('-');
                return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
              }}
            />
            <YAxis
              yAxisId="left"
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
              tickFormatter={val => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={chart.axis}
              fontSize={11}
              tickLine={false}
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
              stroke={chart.line.primary}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="activeUsers"
              name="activeUsers"
              stroke={chart.line.secondary}
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
