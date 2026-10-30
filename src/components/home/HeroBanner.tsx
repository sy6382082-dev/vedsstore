'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroBanner() {
  const scrollToCategories = () => {
    const el = document.getElementById('category-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white border-b border-[#e5e5e5] py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-block px-2.5 py-1 rounded bg-[#f5f5f5] border border-[#e5e5e5] text-xs font-medium text-[#737373]">
              VED-HUB Curated Essentials
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#171717] leading-tight">
              Everyday essentials, made simple.
            </h1>

            <p className="text-base sm:text-lg text-[#737373] max-w-xl leading-relaxed">
              Discover genuine printer supplies, handcrafted jewellery, and daily accessories at VED-HUB. Thoughtfully sourced products with transparent pricing and straightforward service.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/search?q=" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-medium">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToCategories}
                className="w-full sm:w-auto font-medium"
              >
                Browse Categories
              </Button>
            </div>

            {/* Subtle Trust Indicators */}
            <div className="pt-6 border-t border-[#e5e5e5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#737373]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#171717] shrink-0" />
                <span>Free delivery over ₹499</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#171717] shrink-0" />
                <span>100% genuine products</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#171717] shrink-0" />
                <span>Hassle-free 30-day returns</span>
              </div>
            </div>
          </div>

          {/* Right Product-focused Visual */}
          <div className="lg:col-span-5">
            <div className="border border-[#e5e5e5] rounded-lg p-5 bg-[#fafafa]">
              <div className="aspect-[4/3] w-full bg-white rounded border border-[#e5e5e5] overflow-hidden mb-4 relative flex items-center justify-center">
                <img
                  src="/images/brother-ink-products.jpg"
                  alt="VED-HUB featured product range"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[#737373] mb-1">
                <span>Featured Collection</span>
                <span className="font-medium text-[#171717]">In Stock</span>
              </div>
              <h3 className="font-semibold text-sm text-[#171717]">
                Authentic High-Yield Printer Supplies &amp; Curated Accessories
              </h3>
              <p className="text-xs text-[#737373] mt-1">
                From OEM ink refill bottles to ethnic bracelets, find verified quality for everyday life.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
