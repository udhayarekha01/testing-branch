import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Task Tracker Smoke Test', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders task tracker header, metrics, and default tasks', () => {
    render(<App />);

    // Header title and subtitle
    expect(screen.getByText('Simple Task Tracker')).toBeInTheDocument();
    expect(
      screen.getByText('Organize, track, and complete tasks effortlessly')
    ).toBeInTheDocument();

    // Metric cards
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getAllByText('In Progress').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Overdue')).toBeInTheDocument();

    // Default tasks rendered
    expect(screen.getByText('Finalize Q3 roadmap review')).toBeInTheDocument();
    expect(screen.getByText('Prepare design assets for landing page')).toBeInTheDocument();
    expect(screen.getByText('Weekly grocery run and meal prep')).toBeInTheDocument();

    // Add task button
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
  });
});
