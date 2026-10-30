'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, X, AlertTriangle } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_HOURS } from '@/lib/constants';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-40 no-print">
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-popup-title"
          className="mb-3 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-slate-800 dark:text-slate-100 animate-slide-up"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 id="contact-popup-title" className="font-semibold text-sm">Customer Care Support</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Close contact popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs space-y-2">
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-amber-500" />
              <span>For enquiries, call <strong className="text-slate-900 dark:text-white">{CONTACT_PHONE}</strong></span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
              {CONTACT_HOURS}
            </p>
            <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-[10px] leading-tight">
                This is a demo store for evaluation. No real customer calls or commercial orders are dispatched.
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Now (Demo)
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Contact customer care"
        className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center relative group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Contact Us</span>
      </button>
    </div>
  );
}
