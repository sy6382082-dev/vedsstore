'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <section className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Bestsellers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1">
              Popular Items
            </h2>
          </div>

          {/* Scroll arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-md bg-white border border-[#e5e5e5] text-[#171717] hover:bg-[#f5f5f5] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-md bg-white border border-[#e5e5e5] text-[#171717] hover:bg-[#f5f5f5] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel row */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {trending.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[280px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
