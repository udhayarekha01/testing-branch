import { useState, useEffect, useCallback } from 'react';
import type { Filters } from '../data/types';

export function useFilters() {
  const getInitialFilters = (): Filters => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      startDate: params.get('startDate') || '',
      endDate: params.get('endDate') || '',
      category: params.get('category') || 'all',
      region: params.get('region') || 'all',
      search: params.get('search') || ''
    };
  };

  const [filters, setFiltersState] = useState<Filters>(getInitialFilters);

  // Sync to URL
  const setFilters = useCallback((updater: Filters | ((prev: Filters) => Filters)) => {
    setFiltersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const params = new URLSearchParams();

      if (next.startDate) params.set('startDate', next.startDate);
      if (next.endDate) params.set('endDate', next.endDate);
      if (next.category && next.category !== 'all') params.set('category', next.category);
      if (next.region && next.region !== 'all') params.set('region', next.region);
      if (next.search) params.set('search', next.search);

      const queryString = params.toString();
      const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
      window.history.replaceState(null, '', newUrl);

      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'all',
      region: 'all',
      search: ''
    });
  }, [setFilters]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFiltersState({
        startDate: params.get('startDate') || '',
        endDate: params.get('endDate') || '',
        category: params.get('category') || 'all',
        region: params.get('region') || 'all',
        search: params.get('search') || ''
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return { filters, setFilters, resetFilters };
}
