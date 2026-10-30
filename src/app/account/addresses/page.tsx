'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Plus, Star, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Address {
  id: string; label: string; fullName: string; phone: string;
  addressLine1: string; addressLine2?: string | null;
  city: string; state: string; pincode: string; isDefault: boolean;
}

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const emptyForm = { label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAddresses = () => {
    fetch('/api/account/addresses')
      .then((r) => r.json())
      .then((d: { addresses?: Address[] }) => { setAddresses(d.addresses ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/account/addresses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json() as { address?: object; error?: string };
    setSaving(false);
    if (data.address) { showToast('success', 'Address saved!'); setShowForm(false); setForm(emptyForm); fetchAddresses(); }
    else showToast('error', data.error ?? 'Failed to save');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
    const data = await res.json() as { success?: boolean };
    if (data.success) { fetchAddresses(); showToast('success', 'Address removed'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Addresses</h1>
          </div>
          <Button variant="gold" size="sm" onClick={() => setShowForm(true)} className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add New
          </Button>
        </div>

        {toast && (
          <div className={`flex gap-2 p-3 rounded-xl border text-xs ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {loading ? <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}</div>
          : addresses.length === 0 && !showForm ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
              <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No addresses saved</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{addr.label}</span>
                        {addr.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1"><Star className="w-2.5 h-2.5" /> Default</span>}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{addr.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{addr.phone}</p>
                    </div>
                    <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors" aria-label="Delete address">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-400 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add New Address</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[['label','Label (e.g. Home)'],['fullName','Full name *']].map(([k,ph]) => (
                  <div key={k}>
                    <input value={form[k as keyof typeof form] as string} onChange={set(k)} placeholder={ph} required={k==='fullName'} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
                  </div>
                ))}
              </div>
              <input value={form.phone} onChange={set('phone')} placeholder="Mobile number *" required type="tel" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
              <input value={form.addressLine1} onChange={set('addressLine1')} placeholder="Address line 1 *" required className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
              <input value={form.addressLine2} onChange={set('addressLine2')} placeholder="Address line 2 (optional)" className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
              <div className="grid grid-cols-3 gap-3">
                <input value={form.city} onChange={set('city')} placeholder="City *" required className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
                <select value={form.state} onChange={set('state')} required className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all">
                  <option value="">State *</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={form.pincode} onChange={set('pincode')} placeholder="Pincode *" required maxLength={6} pattern="\d{6}" className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all" />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} className="rounded" />
                Set as default address
              </label>
              <div className="flex gap-3">
                <Button type="submit" variant="gold" className="flex-1 font-bold" disabled={saving}>{saving ? 'Saving…' : 'Save Address'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

