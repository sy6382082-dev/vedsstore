'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { CONTACT_PHONE, CONTACT_HOURS } from '@/lib/constants';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print">
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-popup-title"
          className="mb-3 w-72 sm:w-80 bg-white border border-[#e5e5e5] rounded-lg shadow-xl p-4 text-[#171717] animate-slide-up"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <h3 id="contact-popup-title" className="font-semibold text-xs uppercase tracking-wider text-[#171717]">
              Customer Support
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#737373] hover:text-[#171717] p-1"
              aria-label="Close contact popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs space-y-2">
            <p className="flex items-center gap-2 text-[#171717]">
              <Phone className="w-3.5 h-3.5 text-[#171717]" />
              <span>Call us: <strong>{CONTACT_PHONE}</strong></span>
            </p>
            <p className="text-[11px] text-[#737373] pl-5">
              {CONTACT_HOURS}
            </p>
          </div>

          <div className="pt-2 border-t border-[#e5e5e5]">
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s+/g, '')}`}
              className="w-full py-2 bg-[#171717] hover:bg-black text-white rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Customer Care
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Contact customer care"
        className="p-3 rounded-full bg-[#171717] hover:bg-black text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center cursor-pointer"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="sr-only">Contact Us</span>
      </button>
    </div>
  );
}
