import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TableWidget } from '../components/TableWidget';
import type { TableRow } from '../data/types';

const row = (id: string, priority?: unknown): TableRow =>
  ({
    id,
    date: '2024-01-01',
    category: 'SaaS',
    region: 'Europe',
    channel: 'Email',
    transactions: 1,
    revenue: 100,
    satisfaction: 4,
    status: 'Completed',
    priority,
  }) as TableRow;

describe('TableWidget priority', () => {
  it('renders High, Medium and Low badges with colours', () => {
    render(<TableWidget rows={[row('A', 'High'), row('B', 'Medium'), row('C', 'Low')]} />);
    expect(screen.getByText('High').className).toContain('bg-rose-50');
    expect(screen.getByText('Medium').className).toContain('bg-amber-50');
    expect(screen.getByText('Low').className).toContain('bg-emerald-50');
  });

  it('falls back to Medium for missing and invalid priority', () => {
    render(<TableWidget rows={[row('A'), row('B', 'Urgent')]} />);
    expect(screen.getAllByText('Medium')).toHaveLength(2);
  });

  it('has a non-sortable Priority header', () => {
    render(<TableWidget rows={[row('A', 'High')]} />);
    const th = screen.getByRole('columnheader', { name: 'Priority' });
    expect(th.className).not.toContain('cursor-pointer');
    expect(th.querySelector('svg')).toBeNull();
  });
});
