'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroBanner() {
  const scrollToCategories = () => {
    const el = document.getElementById('category-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0f172a] to-[#1e3a5f] text-white py-16 sm:py-24 lg:py-28">
      {/* Decorative Gradient Orbs and Patterns */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Diwali &amp; Festive Collection 2026 • Curated in India</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              India&apos;s Premium <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Shopping Destination
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Jewellery • Accessories • Authentic Printer Supplies. From royal handcrafted Kundan bangles to genuine Brother high-yield ink bottles, experience excellence at Indian prices.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/category/bracelets" className="w-full sm:w-auto">
                <Button variant="gold" size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-amber-500/20">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToCategories}
                className="w-full sm:w-auto border-slate-600 text-white hover:bg-white/10 hover:border-slate-400"
              >
                Explore Categories
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="block font-semibold text-white">Free Express</span>
                  <span className="text-slate-400 text-[11px]">Orders above ₹499</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="block font-semibold text-white">100% Genuine</span>
                  <span className="text-slate-400 text-[11px]">Certified OEM parts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="block font-semibold text-white">30-Day Returns</span>
                  <span className="text-slate-400 text-[11px]">Hassle-free policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Card */}
              <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                  <img
                    src="/images/brother-ink-products.jpg"
                    alt="Brother Store OEM Ink Collections"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
                    Special Offer
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Brother OEM Ink Series</h3>
                    <p className="text-xs text-slate-400">BT5000 / BTD60 Genuine High Yield Bottles</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-amber-400 font-extrabold text-lg">From ₹499</span>
                    <span className="text-[11px] text-slate-400 line-through">MRP ₹799</span>
                  </div>
                </div>

                <Link
                  href="/category/printer-ink"
                  className="w-full block text-center py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  View Printer Ink Range →
                </Link>
              </div>

              {/* Floating Floating Pill */}
              <div className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-fade-in hidden sm:flex">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
                  💎
                </div>
                <div>
                  <div className="text-xs font-bold">Kundan Bangles</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">48% OFF Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
