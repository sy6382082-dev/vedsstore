'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqItems } from '@/data/faq';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#171717]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
            Everything you need to know about deliveries, product genuineness, and order policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id}
                className="rounded-lg bg-white border border-[#e5e5e5] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-medium text-sm text-[#171717] hover:bg-[#fafafa] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5] shrink-0">
                      {item.category}
                    </span>
                    <span>{item.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#737373] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#171717]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#737373] leading-relaxed border-t border-[#f0f0f0]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
