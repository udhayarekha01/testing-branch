export interface Filters {
  startDate?: string;
  endDate?: string;
  category?: string;
  region?: string;
  search?: string;
}

export interface MetricItem {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  change: number; // percentage change, e.g. +12.4
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
}

export interface SeriesPoint {
  date: string;
  revenue: number;
  orders: number;
  activeUsers: number;
}

export interface TableRow {
  id: string;
  date: string;
  category: string;
  region: string;
  channel: string;
  transactions: number;
  revenue: number;
  satisfaction: number;
  status: 'Completed' | 'Pending' | 'Flagged';
}

export interface Dataset {
  metrics: MetricItem[];
  series: SeriesPoint[];
  rows: TableRow[];
}
