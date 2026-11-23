import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="state">{theme}:{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('system')}>system</button>
    </div>
  );
}

const original = window.matchMedia;
function mockMedia(matches: boolean) {
  let handler: ((e: { matches: boolean }) => void) | null = null;
  window.matchMedia = ((q: string) => ({
    matches, media: q,
    addEventListener: (_: string, h: typeof handler) => { handler = h; },
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  return (m: boolean) => act(() => handler?.({ matches: m }));
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = original;
  });

  it('defaults to system (light)', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('state')).toHaveTextContent('system:light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('switches modes, toggles html class and persists', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByText('dark'));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('ada-theme-preference')).toBe('dark');
    await userEvent.click(screen.getByText('light'));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('ada-theme-preference')).toBe('light');
  });

  it('reads stored preference and ignores invalid values', () => {
    localStorage.setItem('ada-theme-preference', 'dark');
    const { unmount } = render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('state')).toHaveTextContent('dark:dark');
    unmount();
    localStorage.setItem('ada-theme-preference', 'bogus');
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('state')).toHaveTextContent('system');
  });

  it('follows system changes in system mode', () => {
    const fire = mockMedia(false);
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fire(true);
    expect(screen.getByTestId('state')).toHaveTextContent('system:dark');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('works when localStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('x'); });
    render(<ThemeProvider><Probe /></ThemeProvider>);
    await userEvent.click(screen.getByText('dark'));
    expect(screen.getByTestId('state')).toHaveTextContent('dark:dark');
    vi.restoreAllMocks();
  });
});
