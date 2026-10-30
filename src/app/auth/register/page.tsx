'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { passwordStrength } from '@/lib/validation';
import { SITE_NAME } from '@/lib/constants';

const Field = ({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, error: err, children }: {
  id: string; label: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; icon: React.ElementType; error?: string; children?: React.ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-[#171717] mb-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
      <input
        id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full pl-9 ${children ? 'pr-10' : 'pr-3'} py-2 rounded-md border ${err ? 'border-red-400' : 'border-[#e5e5e5]'} bg-white text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors`}
      />
      {children}
    </div>
    {err && <p className="text-[11px] text-red-600 mt-1">{err}</p>}
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 sm:p-8 space-y-5">
          {/* Logo & Headline */}
          <div className="text-center space-y-1.5">
            <Link href="/" className="inline-block">
              <span className="font-bold text-2xl tracking-tight text-[#171717]">
                {SITE_NAME}
              </span>
            </Link>
            <h1 className="text-xl font-bold text-[#171717]">Create your account</h1>
            <p className="text-xs text-[#737373]">Fast, simple setup</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-[#fafafa] border border-red-300 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Field id="firstName" label="First name *" value={form.firstName} onChange={set('firstName')} icon={User} placeholder="First name" error={fieldErrors.firstName} />
              <Field id="lastName" label="Last name" value={form.lastName} onChange={set('lastName')} icon={User} placeholder="Last name" />
            </div>

            <Field id="email" label="Email address *" type="email" value={form.email} onChange={set('email')} icon={Mail} placeholder="you@example.com" error={fieldErrors.email} />

            <Field id="phone" label="Mobile number (optional)" type="tel" value={form.phone} onChange={set('phone')} icon={Phone} placeholder="9876543210" error={fieldErrors.phone} />

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#171717] mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Min 8 chars, uppercase, number"
                  className={`w-full pl-9 pr-10 py-2 rounded-md border ${fieldErrors.password ? 'border-red-400' : 'border-[#e5e5e5]'} bg-white text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors`}
                />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1 rounded bg-[#e5e5e5] overflow-hidden">
                    <div className={`h-full bg-[#171717] transition-all ${strengthWidth}`} />
                  </div>
                  <p className="text-[11px] text-[#737373] capitalize">Strength: <span className="font-medium text-[#171717]">{strength}</span></p>
                </div>
              )}
              {fieldErrors.password && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#171717] mb-1">Confirm password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
                <input
                  id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={set('confirmPassword')} placeholder="Re-enter password"
                  className={`w-full pl-9 pr-10 py-2 rounded-md border ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-[#e5e5e5]'} bg-white text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors`}
                />
                <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]" aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-[#171717]" />
                )}
              </div>
              {fieldErrors.confirmPassword && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full text-xs font-medium mt-1">
              Create Account
            </Button>
          </form>

          <div className="pt-3 border-t border-[#e5e5e5] text-center text-xs text-[#737373]">
            Already have an account?{' '}
            <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`} className="font-medium text-[#171717] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#171717] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
