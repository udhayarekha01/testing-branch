import type { Dataset, Filters, MetricItem, SeriesPoint, TableRow } from './types';

// Cache for raw fetched data
let rawCache: { metrics: MetricItem[]; series: SeriesPoint[]; rows: TableRow[] } | null = null;

async function fetchRawData(): Promise<{ metrics: MetricItem[]; series: SeriesPoint[]; rows: TableRow[] }> {
  if (rawCache) {
    return rawCache;
  }

  const [metricsRes, seriesRes, rowsRes] = await Promise.all([
    fetch('/data/metrics.json'),
    fetch('/data/series.json'),
    fetch('/data/rows.json')
  ]);

  if (!metricsRes.ok || !seriesRes.ok || !rowsRes.ok) {
    throw new Error('Failed to fetch dataset from server');
  }

  const metrics: MetricItem[] = await metricsRes.json();
  const series: SeriesPoint[] = await seriesRes.json();
  const rows: TableRow[] = await rowsRes.json();

  rawCache = { metrics, series, rows };
  return rawCache;
}

export async function fetchDataset(filters?: Filters): Promise<Dataset> {
  const { rows } = await fetchRawData();

  // Apply filters client-side over the dataset (mimicking REST query params)
  let filteredRows = [...rows];

  if (filters?.startDate) {
    filteredRows = filteredRows.filter(r => r.date >= filters.startDate!);
  }
  if (filters?.endDate) {
    filteredRows = filteredRows.filter(r => r.date <= filters.endDate!);
  }
  if (filters?.category && filters.category !== 'all') {
    filteredRows = filteredRows.filter(r => r.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.region && filters.region !== 'all') {
    filteredRows = filteredRows.filter(r => r.region.toLowerCase() === filters.region!.toLowerCase());
  }
  if (filters?.search && filters.search.trim().length > 0) {
    const q = filters.search.toLowerCase().trim();
    filteredRows = filteredRows.filter(
      r =>
        r.id.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.channel.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }

  // Derive series from filtered rows
  const seriesMap = new Map<string, SeriesPoint>();
  filteredRows.forEach(r => {
    if (!seriesMap.has(r.date)) {
      seriesMap.set(r.date, { date: r.date, revenue: 0, orders: 0, activeUsers: 0 });
    }
    const pt = seriesMap.get(r.date)!;
    pt.revenue += r.revenue;
    pt.orders += r.transactions;
    pt.activeUsers += Math.round(r.transactions * 1.6);
  });

  const series = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Derive dynamic KPI metrics based on filtered subset
  const totalRevenue = filteredRows.reduce((sum, r) => sum + r.revenue, 0);
  const totalTransactions = filteredRows.reduce((sum, r) => sum + r.transactions, 0);
  const avgSatisfaction =
    filteredRows.length > 0
      ? Math.round((filteredRows.reduce((sum, r) => sum + r.satisfaction, 0) / filteredRows.length) * 10) / 10
      : 0;
  const totalUsers = series.reduce((sum, s) => sum + s.activeUsers, 0);

  const metrics: MetricItem[] = [
    {
      id: 'total-revenue',
      label: 'Total Revenue',
      value: Math.round(totalRevenue),
      formattedValue: `$${Math.round(totalRevenue).toLocaleString('en-US')}`,
      change: 14.8,
      trend: totalRevenue > 0 ? 'up' : 'neutral',
      timeframe: 'Filtered range'
    },
    {
      id: 'active-users',
      label: 'Active Accounts',
      value: totalUsers,
      formattedValue: totalUsers.toLocaleString('en-US'),
      change: 8.2,
      trend: totalUsers > 0 ? 'up' : 'neutral',
      timeframe: 'Filtered range'
    },
    {
      id: 'total-transactions',
      label: 'Total Transactions',
      value: totalTransactions,
      formattedValue: totalTransactions.toLocaleString('en-US'),
      change: -2.4,
      trend: totalTransactions > 0 ? 'down' : 'neutral',
      timeframe: 'Filtered range'
    },
    {
      id: 'satisfaction-score',
      label: 'Satisfaction Score',
      value: avgSatisfaction,
      formattedValue: avgSatisfaction > 0 ? `${avgSatisfaction.toFixed(1)} / 5.0` : 'N/A',
      change: 4.1,
      trend: 'up',
      timeframe: 'Filtered range'
    }
  ];

  return {
    metrics,
    series,
    rows: filteredRows
  };
}
