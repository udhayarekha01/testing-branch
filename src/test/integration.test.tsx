import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import metricsFixture from '../../public/data/metrics.json';
import seriesFixture from '../../public/data/series.json';
import rowsFixture from '../../public/data/rows.json';

describe('Analysis Dashboard Full Flow Tests', () => {
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

  it('filters data by search input', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Detailed Transaction Records')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search records/i);
    fireEvent.change(searchInput, { target: { value: 'TX-1001' } });

    await waitFor(() => {
      expect(screen.getByText('TX-1001')).toBeInTheDocument();
    });

    // Reset button appears and can be clicked
    const resetBtn = screen.getByText('Reset Filters');
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 9')).toBeInTheDocument();
    });
  });

  it('saves and switches named layouts', async () => {
    render(<App />);

    // Click "Save Current View"
    const saveBtn = screen.getByText('Save Current View');
    fireEvent.click(saveBtn);

    const nameInput = screen.getByPlaceholderText(/Layout name/i);
    fireEvent.change(nameInput, { target: { value: 'Executive View' } });

    const submitBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Layout "Executive View" saved successfully.')).toBeInTheDocument();
    });
  });
});
