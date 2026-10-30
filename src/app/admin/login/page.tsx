'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SITE_NAME } from '@/lib/constants';

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
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="font-extrabold text-2xl tracking-tight text-neutral-900">{SITE_NAME}</span>
          </Link>
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-800">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Admin Sign In</h1>
          <p className="mt-1.5 text-xs text-neutral-500">Sign in with your administrator credentials to access the console.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-neutral-700">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-neutral-200 bg-white py-2.5 pl-10 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                    : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-neutral-500 hover:text-black"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 border-t border-neutral-100 pt-4 text-[11px] leading-relaxed text-neutral-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-700" aria-hidden="true" />
            <p>Administrator credentials are authenticated securely.</p>
          </div>
        </div>

        <Link
          href="/"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-xs text-neutral-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to store
        </Link>
      </div>
    </div>
  );
}
