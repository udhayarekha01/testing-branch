import { useState, useMemo, useCallback } from 'react';
import { useDataset } from './hooks/useDataset';
import { useFilters } from './hooks/useFilters';
import { useLayouts } from './hooks/useLayouts';
import { FilterBar } from './components/FilterBar';
import { KpiCard } from './components/KpiCard';
import { LineChartWidget } from './components/LineChartWidget';
import { BarChartWidget } from './components/BarChartWidget';
import { TableWidget } from './components/TableWidget';
import { LayoutSelector } from './components/LayoutSelector';
import { DashboardGrid } from './components/DashboardGrid';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const { filters, setFilters, resetFilters } = useFilters();
  const { data, status, error, retry } = useDataset(filters);
  const {
    activeLayoutName,
    currentLayout,
    savedLayouts,
    saveLayout,
    switchLayout,
    deleteLayout,
    updateCurrentLayout,
    resetToDefault
  } = useLayouts(addToast);

  const categories = useMemo(() => {
    return ['Electronics', 'SaaS', 'Enterprise', 'Consulting', 'Retail'];
  }, []);

  const regions = useMemo(() => {
    return ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East'];
  }, []);

  const isLoading = status === 'loading';

  // Construct dictionary mapping widget IDs to their React elements
  const childrenMap = useMemo(() => {
    const metrics = data?.metrics || [];
    const series = data?.series || [];
    const rows = data?.rows || [];

    return {
      'kpi-0': <KpiCard metric={metrics[0]} isLoading={isLoading} />,
      'kpi-1': <KpiCard metric={metrics[1]} isLoading={isLoading} />,
      'kpi-2': <KpiCard metric={metrics[2]} isLoading={isLoading} />,
      'kpi-3': <KpiCard metric={metrics[3]} isLoading={isLoading} />,
      'chart-line': <LineChartWidget data={series} isLoading={isLoading} />,
      'chart-bar': <BarChartWidget rows={rows} isLoading={isLoading} />,
      'table': <TableWidget rows={rows} isLoading={isLoading} />
    };
  }, [data, isLoading]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                Analysis Dashboard Application
              </h1>
              <p className="text-xs text-slate-500">
                Operational & Business Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LayoutSelector
              activeLayoutName={activeLayoutName}
              savedLayouts={savedLayouts}
              currentLayout={currentLayout}
              onSelectLayout={switchLayout}
              onSaveLayout={saveLayout}
              onDeleteLayout={deleteLayout}
              onResetToDefault={resetToDefault}
            />

            <button
              onClick={retry}
              disabled={isLoading}
              title="Refresh dataset"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Global Error Banner */}
        {status === 'error' && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-rose-900">Failed to load dashboard data</h4>
                <p className="text-xs text-rose-700">{error?.message || 'Network error occurred while fetching REST data.'}</p>
              </div>
            </div>
            <button
              onClick={retry}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          categories={categories}
          regions={regions}
        />

        {/* Dynamic Drag-and-Drop Grid of Widgets */}
        <DashboardGrid
          layout={currentLayout}
          onLayoutChange={updateCurrentLayout}
          childrenMap={childrenMap}
        />
      </main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
