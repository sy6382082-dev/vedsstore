'use client';

import React from 'react';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-amber-500 focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:shadow-xl focus:ring-2 focus:ring-slate-900 transition-all"
    >
      Skip to main content
    </a>
  );
}
