import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

describe('LoginPage Component', () => {
  it('renders login form elements properly', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('validates empty inputs on submit', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<LoginPage onSubmit={handleSubmit} />);

    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('email-error')).toHaveTextContent(/email is required/i);
    expect(screen.getByTestId('password-error')).toHaveTextContent(/password is required/i);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validates invalid email format and short password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByTestId('email-input'), 'not-an-email');
    await user.type(screen.getByTestId('password-input'), '12345');
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('email-error')).toHaveTextContent(/please enter a valid email address/i);
    expect(screen.getByTestId('password-error')).toHaveTextContent(/password must be at least 6 characters/i);
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByTestId('toggle-password');

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
  });

  it('calls onSubmit with entered credentials when valid', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginPage onSubmit={handleSubmit} />);

    await user.type(screen.getByTestId('email-input'), 'john.doe@example.com');
    await user.type(screen.getByTestId('password-input'), 'secret123');
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }));
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        password: 'secret123',
        remember: true,
      });
    });

    expect(await screen.findByText(/you are signed in as john\.doe@example\.com/i)).toBeInTheDocument();
  });

  it('displays error message when onSubmit throws/rejects', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockRejectedValue(new Error('Invalid email or password. Please try again.'));
    render(<LoginPage onSubmit={handleSubmit} />);

    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password. Please try again.');
  });

  it('allows logging out after successful sign in', async () => {
    const user = userEvent.setup();
    render(<LoginPage onSubmit={vi.fn().mockResolvedValue(undefined)} />);

    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.click(screen.getByTestId('submit-button'));

    const signOutBtn = await screen.findByRole('button', { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();

    await user.click(signOutBtn);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});
