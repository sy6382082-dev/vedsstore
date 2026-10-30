'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Cookie, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

const STORAGE_KEY = 'brother_cookie_consent';

const emptySubscribe = () => () => {};

export function CookieConsent() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [dismissed, setDismissed] = useState(false);

  const hasStoredConsent = () => {
    if (typeof window === 'undefined') return true;
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return true;
    }
  };

  const handleConsent = (choice: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  // Hide on SSR or if already dismissed or if stored consent exists
  if (!isClient || dismissed || hasStoredConsent()) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all animate-slide-up no-print"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Cookie Preferences &amp; Privacy
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Brother Store uses cookies to improve your shopping experience, analyze site usage, and personalize content. All stored data remains strictly within your browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleConsent('declined')}
            className="flex-1 sm:flex-none text-xs"
          >
            Decline
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={() => handleConsent('accepted')}
            className="flex-1 sm:flex-none text-xs font-semibold"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

