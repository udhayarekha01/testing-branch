import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Task Tracker Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a new task through the modal', async () => {
    render(<App />);

    // Click Add Task button
    const addButton = screen.getByRole('button', { name: /Add Task/i });
    fireEvent.click(addButton);

    // Modal opens
    expect(screen.getByRole('heading', { name: 'Create New Task' })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Update client presentation slides/i);
    const descInput = screen.getByPlaceholderText(/Add additional details/i);

    fireEvent.change(titleInput, { target: { value: 'Write end-to-end tests' } });
    fireEvent.change(descInput, { target: { value: 'Cover task creation and deletion' } });

    const submitBtn = screen.getByRole('button', { name: 'Create Task' });
    fireEvent.click(submitBtn);

    // Modal closes and new task appears
    await waitFor(() => {
      expect(screen.getByText('Write end-to-end tests')).toBeInTheDocument();
      expect(screen.getByText('Cover task creation and deletion')).toBeInTheDocument();
    });

    // Check toast notification
    expect(screen.getByText('Created task "Write end-to-end tests"')).toBeInTheDocument();
  });

  it('filters tasks by search input', async () => {
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/Search tasks by title or description/i);
    fireEvent.change(searchInput, { target: { value: 'grocery' } });

    await waitFor(() => {
      expect(screen.getByText('Weekly grocery run and meal prep')).toBeInTheDocument();
      expect(screen.queryByText('Finalize Q3 roadmap review')).not.toBeInTheDocument();
    });

    // Clear search using Reset
    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('Finalize Q3 roadmap review')).toBeInTheDocument();
    });
  });

  it('toggles task completion and clears completed tasks', async () => {
    render(<App />);

    // Check grocery task starts completed
    expect(screen.getByText('Weekly grocery run and meal prep')).toBeInTheDocument();

    // Clear completed button should be present
    const clearBtn = screen.getByRole('button', { name: /Clear completed/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    // Completed task should be removed
    await waitFor(() => {
      expect(screen.queryByText('Weekly grocery run and meal prep')).not.toBeInTheDocument();
    });
  });

  it('deletes an individual task', async () => {
    render(<App />);

    expect(screen.getByText('Finalize Q3 roadmap review')).toBeInTheDocument();

    const deleteButtons = screen.getAllByLabelText('Delete task');
    // Delete the first task
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Finalize Q3 roadmap review')).not.toBeInTheDocument();
    });
  });

  it('edits an existing task', async () => {
    render(<App />);

    const editButtons = screen.getAllByLabelText('Edit task');
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeInTheDocument();

    const titleInput = screen.getByDisplayValue('Finalize Q3 roadmap review');
    fireEvent.change(titleInput, { target: { value: 'Finalize Q3 roadmap review [URGENT]' } });

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Finalize Q3 roadmap review [URGENT]')).toBeInTheDocument();
    });
  });
});
