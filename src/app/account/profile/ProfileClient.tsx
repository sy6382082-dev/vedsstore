'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  user: {
    id: string; email: string; phone?: string | null;
    profile: { firstName?: string | null; lastName?: string | null } | null;
  };
}

export default function ProfileClient({ user }: Props) {
  const [form, setForm] = useState({
    firstName: user.profile?.firstName ?? '',
    lastName: user.profile?.lastName ?? '',
    phone: user.phone ?? '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) { setStatus('success'); setMessage('Profile saved!'); }
      else { setStatus('error'); setMessage(data.error ?? 'Save failed'); }
    } catch { setStatus('error'); setMessage('Network error'); }
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/account" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        </div>

        {status === 'success' && (
          <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />{message}
          </div>
        )}
        {status === 'error' && (
          <div className="flex gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />{message}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={user.email} disabled className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed (contact support)</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['firstName','First name'], ['lastName','Last name']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={form[k as keyof typeof form]} onChange={set(k)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mobile number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.phone} onChange={set('phone')} type="tel" placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
              </div>
            </div>

            <Button type="submit" variant="gold" className="w-full font-bold" disabled={status === 'saving'}>
              <Save className="w-4 h-4 mr-2" />
              {status === 'saving' ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

