'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email.trim(), password, { adminOnly: true });
    setIsLoading(false);

    if (result.success) {
      router.replace('/admin');
    } else {
      setError(result.error ?? 'Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-950/30">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-300">Brother Store</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with your administrator account to continue.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 flex gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-slate-200">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-200"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-blue-300 transition-colors hover:text-blue-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full font-bold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : 'Sign in to admin'}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <p>Administrator access is verified securely when you sign in.</p>
          </div>
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to store
        </Link>
      </div>
    </div>
  );
}
