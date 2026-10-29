import React, { useState } from 'react';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid email or password.');
      const data = await res.json();
      onSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" aria-labelledby="login-heading">
      <h1 id="login-heading">Sign in</h1>
      <p className="subtitle">Welcome back! Please enter your details.</p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="row">
          <label className="remember">
            <input type="checkbox" name="remember" /> Remember me
          </label>
          <a href="#" className="link">
            Forgot password?
          </a>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="footer">
        Don&apos;t have an account? <a href="#" className="link">Sign up</a>
      </p>
    </section>
  );
}
