'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { passwordStrength } from '@/lib/validation';

const Field = ({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, error: err, children }: {
  id: string; label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon: React.ElementType; error?: string; children?: React.ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full pl-10 ${children ? 'pr-11' : 'pr-4'} py-2.5 rounded-xl border ${err ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all`}
      />
      {children}
    </div>
    {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
  </div>
);

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/account';
  const { register } = useAuth();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const strength = passwordStrength(form.password);
  const strengthColor = { weak: 'bg-red-500', medium: 'bg-amber-500', strong: 'bg-emerald-500' }[strength];
  const strengthWidth = { weak: 'w-1/3', medium: 'w-2/3', strong: 'w-full' }[strength];

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (form.password.length < 8) errs.password = 'Min 8 chars, 1 uppercase, 1 number';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Must include a number';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setIsLoading(true);
    const result = await register({
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      phone: form.phone.trim() || undefined,
    });
    setIsLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-5">

          {/* Logo */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-black text-3xl tracking-tighter text-[#0047BA] dark:text-blue-400 leading-none lowercase">
                brother
              </span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Free forever • No credit card needed</p>
            </div>
          </div>

          <div className="flex gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Dev mode</strong> — account is created instantly. In production, email verification would be sent.</span>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Field id="firstName" label="First name *" value={form.firstName} onChange={set('firstName')} icon={User} placeholder="Priya" error={fieldErrors.firstName} />
              <Field id="lastName" label="Last name" value={form.lastName} onChange={set('lastName')} icon={User} placeholder="Sharma" />
            </div>

            <Field id="email" label="Email address *" type="email" value={form.email} onChange={set('email')} icon={Mail} placeholder="you@example.com" error={fieldErrors.email} />

            <Field id="phone" label="Mobile number (optional)" type="tel" value={form.phone} onChange={set('phone')} icon={Phone} placeholder="+91 98765 43210" error={fieldErrors.phone} />

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Min 8 chars, uppercase, number"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border ${fieldErrors.password ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all`}
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthColor} ${strengthWidth}`} />
                  </div>
                  <p className="text-xs text-slate-500 capitalize">Strength: <span className="font-semibold">{strength}</span></p>
                </div>
              )}
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={set('confirmPassword')} placeholder="Re-enter password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border ${fieldErrors.confirmPassword ? 'border-red-400 dark:border-red-600' : 'border-slate-300 dark:border-slate-700'} bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all`}
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors" aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href={`/auth/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          <Link href="/" className="hover:text-amber-500 transition-colors">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
