'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Eye, EyeOff, Lock, ArrowLeft, Shield, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPw.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setIsPending(true);
    try {
      const res = await fetch('/api/account/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      } else {
        showToast(data.error ?? 'Failed to change password', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-amber-500 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Account
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your account security and preferences.
          </p>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use a strong password with letters, numbers and symbols.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showNewPw ? 'Hide password' : 'Show password'}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  className={`w-full pr-10 pl-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    confirmPw && newPw !== confirmPw
                      ? 'border-red-400'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPw && newPw !== confirmPw && (
                <p className="text-[11px] text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending || !currentPw || !newPw || !confirmPw || newPw !== confirmPw}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors"
            >
              {isPending ? 'Changing Password…' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Account Security</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your account details at a glance.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Email</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Phone</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user.phone ?? 'Not added'}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900/50 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Account deletion is permanent and cannot be undone.
              </p>
            </div>
          </div>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete My Account
            </button>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                ⚠️ Account deletion is not available in Phase 2 (Demo Store). This feature will be enabled in a later release. Contact{' '}
                <a href="mailto:support@brother.in" className="underline">support@brother.in</a> for assistance.
              </p>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

