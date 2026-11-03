import {
  type FormEvent,
  type ChangeEvent,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react';
import './LoginPage.css';

export interface LoginPageProps {
  /**
   * Title displayed at the top of the login card.
   * @default "Welcome back"
   */
  title?: string;
  /**
   * Subtitle shown below the title.
   * @default "Sign in to your account to continue"
   */
  subtitle?: string;
  /**
   * Async function invoked when the form is submitted with valid data.
   * Throw or reject to surface an error to the user.
   */
  onSubmit?: (credentials: { email: string; password: string; remember: boolean }) => Promise<void> | void;
  /**
   * Render prop for the footer (e.g. "Sign up" link).
   */
  footer?: ReactNode;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function MailIcon() {
  return (
    <Icon>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
  );
}

function LockIcon() {
  return (
    <Icon>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

function EyeIcon() {
  return (
    <Icon>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

function EyeOffIcon() {
  return (
    <Icon>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </Icon>
  );
}

function AlertCircleIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </Icon>
  );
}

function ShieldCheckIcon() {
  return (
    <Icon width="28" height="28">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

function LogOutIcon() {
  return (
    <Icon width="16" height="16">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </Icon>
  );
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
}

export function LoginPage({
  title = 'Welcome back',
  subtitle = 'Sign in to your account to continue',
  onSubmit,
  footer,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.({
        email: email.trim(),
        password,
        remember,
      });
      setSignedInAs(email.trim());
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleLogout = () => {
    setSignedInAs(null);
    setEmail('');
    setPassword('');
    setRemember(false);
    setErrors({});
    setSubmitError(null);
  };

  if (signedInAs) {
    return (
      <main className="login-container" aria-labelledby="signed-in-heading">
        <header className="login-header">
          <div className="login-logo" aria-hidden="true">
            <ShieldCheckIcon />
          </div>
          <h1 id="signed-in-heading">Signed in</h1>
          <p className="login-subtitle">You are signed in as {signedInAs}</p>
        </header>
        <div className="user-badge">
          <p style={{ color: '#475569' }}>Welcome back! Start exploring your dashboard.</p>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOutIcon />
              <span>Sign out</span>
            </span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="login-container" aria-labelledby="login-heading">
      <header className="login-header">
        <div className="login-logo" aria-hidden="true">
          <ShieldCheckIcon />
        </div>
        <h1 id="login-heading">{title}</h1>
        <p className="login-subtitle">{subtitle}</p>
      </header>

      {submitError && (
        <div role="alert" className="alert-box alert-error">
          <AlertCircleIcon />
          <span>{submitError}</span>
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="input-wrapper">
            <span className="input-icon">
              <MailIcon />
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? 'input-invalid' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={submitting}
              data-testid="email-input"
            />
          </div>
          {errors.email && (
            <span id="email-error" className="field-error" data-testid="email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="input-wrapper">
            <span className="input-icon">
              <LockIcon />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`form-input has-toggle ${errors.password ? 'input-invalid' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              disabled={submitting}
              data-testid="password-input"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              tabIndex={-1}
              data-testid="toggle-password"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && (
            <span id="password-error" className="field-error" data-testid="password-error">
              {errors.password}
            </span>
          )}
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              className="remember-checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={submitting}
            />
            Remember me
          </label>
          <a href="#forgot" className="forgot-password-link">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={submitting}
          data-testid="submit-button"
        >
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="divider" role="separator" aria-label="Or continue with">
        <span>Or continue with</span>
      </div>

      <div className="social-login-grid">
        <button type="button" className="social-btn" aria-label="Sign in with Google">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
        <button type="button" className="social-btn" aria-label="Sign in with GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-1.93c-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.74 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.07 0 0 .96-.31 3.15 1.18a10.96 10.96 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.6.23 2.78.11 3.07.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.21c0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
            />
          </svg>
          GitHub
        </button>
      </div>

      {footer ? (
        <div className="login-footer">{footer}</div>
      ) : (
        <p className="login-footer">
          Don&apos;t have an account?
          <a href="#signup" className="signup-link">
            Sign up
          </a>
        </p>
      )}
    </main>
  );
}

export default LoginPage;
