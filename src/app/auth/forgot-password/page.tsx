'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SITE_NAME } from '@/lib/constants';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'If an account with that email exists, we have sent instructions.');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1.5">
            <Link href="/" className="inline-block">
              <span className="font-bold text-2xl tracking-tight text-[#171717]">{SITE_NAME}</span>
            </Link>
            <h1 className="text-xl font-bold text-[#171717]">Forgot your password?</h1>
            <p className="text-xs text-[#737373]">Enter your email and we&apos;ll send reset instructions.</p>
          </div>

          {status === 'success' ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center mx-auto text-[#171717]">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#171717] leading-relaxed">{message}</p>
              <Link href="/auth/login">
                <Button variant="primary" className="w-full text-xs">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-[#fafafa] border border-red-300 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-[#171717] mb-1">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
                    <input
                      id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-md border border-[#e5e5e5] bg-white text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="md" className="w-full text-xs font-medium" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          <div className="flex justify-center pt-2">
            <Link href="/auth/login" className="text-xs text-[#737373] hover:text-[#171717] hover:underline flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
