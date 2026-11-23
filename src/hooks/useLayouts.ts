import { useState, useEffect, useCallback } from 'react';
import type { LayoutItem } from 'react-grid-layout/legacy';

export const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'kpi-0', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-1', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-2', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'kpi-3', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
  { i: 'chart-line', x: 0, y: 2, w: 6, h: 5, minW: 4, minH: 4 },
  { i: 'chart-bar', x: 6, y: 2, w: 6, h: 5, minW: 4, minH: 4 },
  { i: 'table', x: 0, y: 7, w: 12, h: 6, minW: 6, minH: 4 }
];

const STORAGE_KEY = 'ada_dashboard_saved_layouts_v1';
const ACTIVE_LAYOUT_KEY = 'ada_dashboard_active_layout_name';

export interface UseLayoutsResult {
  activeLayoutName: string;
  currentLayout: LayoutItem[];
  savedLayouts: Record<string, LayoutItem[]>;
  saveLayout: (name: string, layout: LayoutItem[]) => boolean;
  switchLayout: (name: string) => void;
  deleteLayout: (name: string) => boolean;
  updateCurrentLayout: (layout: LayoutItem[]) => void;
  resetToDefault: () => void;
  storageAvailable: boolean;
}

export function useLayouts(onToast?: (type: 'success' | 'error' | 'info', message: string) => void): UseLayoutsResult {
  const [storageAvailable, setStorageAvailable] = useState<boolean>(true);
  const [activeLayoutName, setActiveLayoutName] = useState<string>('Default');
  const [currentLayout, setCurrentLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [savedLayouts, setSavedLayouts] = useState<Record<string, LayoutItem[]>>({
    Default: DEFAULT_LAYOUT
  });

  // Verify and load localStorage on mount
  useEffect(() => {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      setStorageAvailable(true);

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedLayouts(prev => ({ ...prev, ...parsed, Default: DEFAULT_LAYOUT }));
      }

      const active = window.localStorage.getItem(ACTIVE_LAYOUT_KEY);
      if (active && (active === 'Default' || (stored && JSON.parse(stored)[active]))) {
        setActiveLayoutName(active);
        if (active === 'Default') {
          setCurrentLayout(DEFAULT_LAYOUT);
        } else if (stored) {
          setCurrentLayout(JSON.parse(stored)[active]);
        }
      }
    } catch {
      setStorageAvailable(false);
      onToast?.('error', 'Browser localStorage unavailable. Layouts will only persist in memory this session.');
    }
  }, []);

  const saveLayout = useCallback((name: string, layout: LayoutItem[]): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      onToast?.('error', 'Please provide a valid layout name.');
      return false;
    }

    if (trimmed.toLowerCase() === 'default') {
      onToast?.('error', 'The Default layout cannot be overwritten.');
      return false;
    }

    const nextSaved = { ...savedLayouts, [trimmed]: layout };
    setSavedLayouts(nextSaved);
    setActiveLayoutName(trimmed);
    setCurrentLayout(layout);

    if (storageAvailable) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSaved));
        window.localStorage.setItem(ACTIVE_LAYOUT_KEY, trimmed);
        onToast?.('success', `Layout "${trimmed}" saved successfully.`);
      } catch {
        onToast?.('error', 'Failed to persist layout to localStorage (storage full or disabled).');
      }
    } else {
      onToast?.('info', `Layout "${trimmed}" saved in-memory for this session.`);
    }

    return true;
  }, [savedLayouts, storageAvailable, onToast]);

  const switchLayout = useCallback((name: string) => {
    const target = savedLayouts[name];
    if (!target) return;

    setActiveLayoutName(name);
    setCurrentLayout(target);

    if (storageAvailable) {
      try {
        window.localStorage.setItem(ACTIVE_LAYOUT_KEY, name);
      } catch {
        // ignore
      }
    }
    onToast?.('info', `Switched to "${name}" layout.`);
  }, [savedLayouts, storageAvailable, onToast]);

  const deleteLayout = useCallback((name: string): boolean => {
    if (name === 'Default') {
      onToast?.('error', 'The default layout cannot be deleted.');
      return false;
    }

    const nextSaved = { ...savedLayouts };
    delete nextSaved[name];
    setSavedLayouts(nextSaved);

    if (storageAvailable) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSaved));
      } catch {
        // ignore
      }
    }

    if (activeLayoutName === name) {
      setActiveLayoutName('Default');
      setCurrentLayout(DEFAULT_LAYOUT);
      if (storageAvailable) {
        window.localStorage.setItem(ACTIVE_LAYOUT_KEY, 'Default');
      }
    }

    onToast?.('success', `Layout "${name}" was deleted.`);
    return true;
  }, [savedLayouts, activeLayoutName, storageAvailable, onToast]);

  const updateCurrentLayout = useCallback((newLayout: LayoutItem[]) => {
    setCurrentLayout(newLayout);
  }, []);

  const resetToDefault = useCallback(() => {
    setActiveLayoutName('Default');
    setCurrentLayout(DEFAULT_LAYOUT);
    if (storageAvailable) {
      window.localStorage.setItem(ACTIVE_LAYOUT_KEY, 'Default');
    }
    onToast?.('info', 'Reset view to default layout.');
  }, [storageAvailable, onToast]);

  return {
    activeLayoutName,
    currentLayout,
    savedLayouts,
    saveLayout,
    switchLayout,
    deleteLayout,
    updateCurrentLayout,
    resetToDefault,
    storageAvailable
  };
}
