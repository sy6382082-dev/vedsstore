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
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-lg mx-auto px-4 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/account" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">My Profile</h1>
        </div>

        {status === 'success' && (
          <div className="flex gap-2 p-3 rounded-lg bg-neutral-100 border border-neutral-300 text-xs text-neutral-900">
            <CheckCircle className="w-4 h-4 shrink-0 text-neutral-900" />{message}
          </div>
        )}
        {status === 'error' && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />{message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-5 shadow-sm">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input value={user.email} disabled className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-100 text-sm text-neutral-500 cursor-not-allowed" />
            </div>
            <p className="text-xs text-neutral-400 mt-1">Email cannot be changed (contact support)</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['firstName','First name'], ['lastName','Last name']].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input value={form[k as keyof typeof form]} onChange={set(k)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:border-black transition-all" />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Mobile number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input value={form.phone} onChange={set('phone')} type="tel" placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:border-black transition-all" />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full font-medium" disabled={status === 'saving'}>
              <Save className="w-4 h-4 mr-2" />
              {status === 'saving' ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
