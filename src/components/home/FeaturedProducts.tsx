'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products as fallbackProducts } from '@/data/products';
import { ProductCard } from '@/components/ui/ProductCard';
import type { Product } from '@/types';

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>(() =>
    fallbackProducts.filter((p) => p.featured).slice(0, 8)
  );

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products?.length > 0) {
          setFeatured(data.products.slice(0, 8));
        }
      })
      .catch(() => {
        // preserve fallback
      });
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            href="/search?q="
            className="text-xs sm:text-sm font-medium text-[#171717] hover:underline inline-flex items-center gap-1.5"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
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
