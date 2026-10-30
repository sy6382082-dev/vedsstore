'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { products as fallbackProducts } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import type { Product } from '@/types';

export function TrendingItems() {
  const [trending, setTrending] = useState<Product[]>(() =>
    fallbackProducts.filter((p) => p.badge === 'Trending' || p.badge === 'Best Seller')
  );

  useEffect(() => {
    fetch('/api/products?sort=rating&order=desc')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products?.length > 0) {
          const filtered = data.products.filter(
            (p: Product) => p.badge === 'Trending' || p.badge === 'Best Seller' || p.rating >= 4.7
          );
          if (filtered.length > 0) setTrending(filtered);
        }
      })
      .catch(() => {});
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500">
              <Flame className="w-3.5 h-3.5" />
              <span>Hot Picks Right Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Trending This Week
            </h2>
          </div>

          {/* Scroll arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trending.map((product) => (
            <div
              key={product.id}
              className="w-72 sm:w-80 shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
