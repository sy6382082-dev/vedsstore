'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { products as fallbackProducts } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>(() =>
    fallbackProducts.filter((p) => p.featured).slice(0, 6)
  );

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products?.length > 0) {
          setFeatured(data.products.slice(0, 6));
        }
      })
      .catch(() => {
        // keep fallback
      });
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            href="/search?q="
            className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 inline-flex items-center gap-1.5 group"
          >
            Browse Full Catalog
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
