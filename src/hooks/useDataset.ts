import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchDataset } from '../data/api';
import type { Dataset, Filters } from '../data/types';

export interface UseDatasetResult {
  data: Dataset | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: Error | null;
  retry: () => void;
}

export function useDataset(filters: Filters): UseDatasetResult {
  const [data, setData] = useState<Dataset | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [trigger, setTrigger] = useState(0);

  const retry = useCallback(() => {
    setTrigger(t => t + 1);
  }, []);

  const filtersKey = JSON.stringify(filters);
  const activeRequestRef = useRef<number>(0);

  useEffect(() => {
    const requestId = ++activeRequestRef.current;
    setStatus('loading');
    setError(null);

    fetchDataset(filters)
      .then(res => {
        if (requestId === activeRequestRef.current) {
          setData(res);
          setStatus('success');
        }
      })
      .catch(err => {
        if (requestId === activeRequestRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setStatus('error');
        }
      });
  }, [filtersKey, trigger]);

  return { data, status, error, retry };
}
