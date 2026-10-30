'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/account';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">

          {/* Logo */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-black text-3xl tracking-tighter text-[#0047BA] dark:text-blue-400 leading-none lowercase">
                brother
              </span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account</p>
            </div>
          </div>

          {/* Dev notice */}
          <div className="flex gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Development mode</strong> — credentials are stored securely.
              Password requires 8+ chars, 1 uppercase, 1 number.
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-amber-600 dark:text-amber-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          <Link href="/" className="hover:text-amber-500 transition-colors">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
