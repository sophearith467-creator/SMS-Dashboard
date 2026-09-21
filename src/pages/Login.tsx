import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../data/users';
import { roleLabel } from '../lib/roles';

export function Login() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-canvas px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[420px]">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-base font-bold text-white shadow-brand">
            M
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-fg">Welcome back</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            Sign in to the Meridian mission management console.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Work email"
              type="email"
              autoComplete="email"
              required
              icon={MailIcon}
              placeholder="you@nexus.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)} />
            

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              icon={LockIcon}
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="rounded-lg p-1.5 transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-fg">
                
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              } />
            

            {error &&
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3">
              
                <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-danger-text" aria-hidden />
                <p className="text-[13px] leading-relaxed text-danger-text">{error}</p>
              </motion.div>
            }

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[13px] text-fg-muted">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-line-strong text-brand focus:ring-brand" />
                
                Keep me signed in
              </label>
              <button type="button" className="text-[13px] font-medium text-brand-text hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface-muted p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
            Demo accounts · password {DEMO_PASSWORD}
          </p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) =>
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(DEMO_PASSWORD);
                setError(null);
              }}
              className="rounded-xl border border-transparent bg-surface px-3 py-2 text-left transition-[border-color,box-shadow] duration-150 ease-out hover:border-line-strong hover:shadow-soft">
              
                <span className="block text-[13px] font-medium text-fg">{account.label}</span>
                <span className="block text-[11.5px] text-fg-muted">{roleLabel(account.role)}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>);

}