import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import { useChartTheme, getChartTheme } from '../../hooks/useChartTheme';

describe('useChartTheme', () => {
  it('returns distinct light and dark tokens', () => {
    expect(getChartTheme('light').grid).not.toBe(getChartTheme('dark').grid);
    expect(getChartTheme('dark').tooltip.backgroundColor).toBe('#0f172a');
  });

  it('reacts to theme changes', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;
    const { result } = renderHook(() => ({ chart: useChartTheme(), t: useTheme() }), { wrapper });
    const before = result.current.chart.axis;
    act(() => result.current.t.setTheme('dark'));
    expect(result.current.chart.axis).not.toBe(before);
  });
});
