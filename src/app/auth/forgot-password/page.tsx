'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      if (data.success) {
        setStatus('success');
        setMessage(data.message ?? 'Reset instructions sent.');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'An error occurred.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl">B</div>
              <span className="font-extrabold text-xl text-slate-900 dark:text-white">Brother<span className="text-amber-500">Store</span></span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot your password?</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter your email and we&apos;ll send reset instructions.</p>
          </div>

          {status === 'success' ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
              <p className="text-xs text-slate-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <strong>Development mode:</strong> No email is actually sent. Configure SMTP environment variables for production email delivery.
              </p>
              <Link href="/auth/login">
                <Button variant="gold" className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="flex gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{message}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          <div className="flex justify-center">
            <Link href="/auth/login" className="text-xs text-slate-500 hover:text-amber-500 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

