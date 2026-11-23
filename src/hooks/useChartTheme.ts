import { useTheme } from '../context/ThemeContext';
import type { ResolvedTheme } from '../types/theme';

export interface ChartTheme {
  grid: string;
  axis: string;
  legend: string;
  tooltip: { backgroundColor: string; border: string; color: string };
  line: { primary: string; secondary: string };
  bars: string[];
}

const LIGHT: ChartTheme = {
  grid: '#f1f5f9',
  axis: '#64748b',
  legend: '#334155',
  tooltip: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' },
  line: { primary: '#4f46e5', secondary: '#06b6d4' },
  bars: ['#6366f1', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'],
};

const DARK: ChartTheme = {
  grid: '#334155',
  axis: '#94a3b8',
  legend: '#e2e8f0',
  tooltip: { backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' },
  line: { primary: '#818cf8', secondary: '#22d3ee' },
  bars: ['#818cf8', '#60a5fa', '#38bdf8', '#34d399', '#fbbf24', '#f472b6'],
};

export function getChartTheme(resolved: ResolvedTheme): ChartTheme {
  return resolved === 'dark' ? DARK : LIGHT;
}

export function useChartTheme(): ChartTheme {
  return getChartTheme(useTheme().resolvedTheme);
}
