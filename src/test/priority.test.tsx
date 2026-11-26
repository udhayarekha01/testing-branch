import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from '../App';

const KEY = 'task_tracker_tasks_v1';
const mk = (id: string, priority: unknown, dueDate?: string) => ({
  id, title: `Task ${id}`, status: 'todo', priority, category: 'Work', dueDate,
  createdAt: new Date().toISOString(),
});
const badges = () => screen.getAllByLabelText(/^(High|Medium|Low) priority$/).map(e => e.getAttribute('aria-label'));
const titles = () => screen.getAllByText(/^Task /).map(e => e.textContent);

describe('Task priority', () => {
  beforeEach(() => localStorage.clear());

  it('modal offers three priorities, default Medium', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    const select = screen.getByDisplayValue('Medium Priority') as HTMLSelectElement;
    expect(within(select).getAllByRole('option').map(o => o.textContent)).toEqual([
      'Low Priority', 'Medium Priority', 'High Priority',
    ]);
  });

  it('shows accessible badges and persists a new task priority', () => {
    const { unmount } = render(<App />);
    expect(badges()).toEqual(expect.arrayContaining(['High priority', 'Medium priority', 'Low priority']));
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    fireEvent.change(screen.getByPlaceholderText(/Update client presentation slides/i), { target: { value: 'Zed' } });
    fireEvent.change(screen.getByDisplayValue('Medium Priority'), { target: { value: 'low' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Task' }));
    unmount();
    render(<App />);
    expect(screen.getByText('Zed')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(KEY)!).find((t: { title: string }) => t.title === 'Zed').priority).toBe('low');
  });

  it('treats missing or invalid stored priority as Medium', () => {
    localStorage.setItem(KEY, JSON.stringify([mk('a', 'urgent'), mk('b', undefined)]));
    render(<App />);
    expect(badges()).toEqual(['Medium priority', 'Medium priority']);
  });

  it('falls back to default tasks on corrupt data', () => {
    localStorage.setItem(KEY, '{nope');
    render(<App />);
    expect(screen.getByText('Finalize Q3 roadmap review')).toBeInTheDocument();
  });

  it('filters by priority and resets', () => {
    localStorage.setItem(KEY, JSON.stringify([mk('a', 'high'), mk('b', 'low')]));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Filter by priority'), { target: { value: 'high' } });
    expect(titles()).toEqual(['Task a']);
    fireEvent.click(screen.getByText('Reset'));
    expect(titles()).toHaveLength(2);
    expect((screen.getByLabelText('Filter by priority') as HTMLSelectElement).value).toBe('all');
  });

  it('sorts High to Low with due-date tie-break', () => {
    localStorage.setItem(KEY, JSON.stringify([
      mk('low', 'low', '2030-01-01'),
      mk('h-none', 'high'),
      mk('h-late', 'high', '2030-03-01'),
      mk('h-early', 'high', '2030-02-01'),
      mk('med', 'medium', '2030-01-01'),
    ]));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Sort tasks'), { target: { value: 'priorityDesc' } });
    expect(titles()).toEqual(['Task h-early', 'Task h-late', 'Task h-none', 'Task med', 'Task low']);
  });
});
