'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Cookie } from 'lucide-react';
import { Button } from './Button';
import { SITE_NAME } from '@/lib/constants';

const STORAGE_KEY = 'vedhub_cookie_consent';
const LEGACY_STORAGE_KEY = 'brother_cookie_consent';

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
      return Boolean(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY));
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
      className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white border-t border-[#e5e5e5] shadow-lg transition-all no-print"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#f5f5f5] text-[#171717] shrink-0 border border-[#e5e5e5]">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#171717]">
              Cookie Preferences &amp; Privacy
            </p>
            <p className="text-xs text-[#737373] mt-0.5">
              {SITE_NAME} uses essential cookies for cart persistence and secure navigation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleConsent('declined')}
            className="flex-1 sm:flex-none text-xs"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleConsent('accepted')}
            className="flex-1 sm:flex-none text-xs font-medium"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
