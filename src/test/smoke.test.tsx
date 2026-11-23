import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import metricsFixture from '../../public/data/metrics.json';
import seriesFixture from '../../public/data/series.json';
import rowsFixture from '../../public/data/rows.json';

describe('Dashboard Render Smoke Test', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('metrics.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(metricsFixture)
        });
      }
      if (url.includes('series.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(seriesFixture)
        });
      }
      if (url.includes('rows.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(rowsFixture)
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    }));
  });

  it('renders dashboard header, controls, and loaded data cleanly', async () => {
    render(<App />);
    expect(screen.getByText('Analysis Dashboard Application')).toBeInTheDocument();
    expect(screen.getByText('Operational & Business Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Save Current View')).toBeInTheDocument();

    // Wait for data to load and KPI cards to appear
    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Active Accounts')).toBeInTheDocument();
      expect(screen.getByText('Total Transactions')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Score')).toBeInTheDocument();
    });

    // Check charts and table headers
    expect(screen.getByText('Revenue & Active Users Trend')).toBeInTheDocument();
    expect(screen.getByText('Revenue by Category')).toBeInTheDocument();
    expect(screen.getByText('Detailed Transaction Records')).toBeInTheDocument();
  });
});
