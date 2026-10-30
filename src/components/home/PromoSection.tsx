'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, Star, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PromoSection() {
  const trustItems = [
    {
      icon: <Truck className="w-6 h-6 text-amber-500" />,
      title: 'Free Shipping Above ₹499',
      description: 'Lightning-fast express dispatch across metro & tier 2/3 cities',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber-500" />,
      title: 'Easy 30-Day Returns',
      description: 'Zero questions asked return & replacement guarantee',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: '100% Genuine Supplies',
      description: 'Manufacturer warranty backed authentic OEM cartridges & inks',
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500" />,
      title: '10,000+ Happy Customers',
      description: 'Rated 4.8/5 across India for craft excellence & fast delivery',
    },
  ];

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-4 hover:border-amber-400 dark:hover:border-amber-500/50 transition-colors"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Big Promo Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 p-8 sm:p-12 text-slate-950 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-bold shadow-sm">
              <Tag className="w-3.5 h-3.5" />
              <span>FESTIVE SPECIAL OFFER</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 leading-tight">
              Enjoy Flat 15% Extra Off on First Order with Code: <span className="underline decoration-slate-950">NEXA15</span>
            </h3>

            <p className="text-sm sm:text-base font-medium text-slate-900/90 max-w-xl">
              Applicable on all handcrafted bangles, nail kits, and high-capacity Brother refill inks. Free shipping unlocked on carts over ₹499!
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/search?q=brother">
                <Button variant="primary" className="bg-slate-950 text-white hover:bg-slate-800 text-xs sm:text-sm font-bold">
                  Shop Brother Inks
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/category/bracelets">
                <Button variant="secondary" className="bg-white/90 text-slate-950 hover:bg-white text-xs sm:text-sm font-bold">
                  Explore Bangles
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative graphic / background motif */}
          <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-15 text-8xl font-black select-none pointer-events-none hidden lg:block">
            NEXA
          </div>
        </div>
      </div>
    </section>
  );
}
