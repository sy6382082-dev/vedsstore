'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Headphones, ArrowRight } from 'lucide-react';

export function PromoSection() {
  const trustItems = [
    {
      icon: <Truck className="w-5 h-5 text-[#171717]" />,
      title: 'Free Shipping Above ₹499',
      description: 'Standard express dispatch across metro and tier cities.',
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-[#171717]" />,
      title: '30-Day Returns',
      description: 'Straightforward return policy on eligible original-packaged items.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#171717]" />,
      title: '100% Genuine Supplies',
      description: 'Factory-sealed OEM printer inks and curated accessories.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#171717]" />,
      title: 'Dedicated Support',
      description: 'Customer service available Monday to Saturday 9 AM - 8 PM IST.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg bg-white border border-[#e5e5e5] hover:border-[#171717] transition-colors"
            >
              <div className="mb-3 text-[#171717]">{item.icon}</div>
              <h3 className="font-semibold text-sm text-[#171717]">
                {item.title}
              </h3>
              <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Minimalist Banner */}
        <div className="rounded-lg bg-[#171717] p-8 sm:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-wider text-[#a3a3a3] font-medium">
              The VED-HUB Commitment
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Simple ordering. Dependable essentials.
            </h2>
            <p className="text-xs sm:text-sm text-[#d4d4d4] leading-relaxed">
              We focus on product authenticity, accurate inventory, and no-friction shopping. Everything you need, simply delivered.
            </p>
          </div>

          <Link
            href="/search?q="
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-[#171717] hover:bg-[#f5f5f5] text-xs font-semibold transition-colors shrink-0"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
