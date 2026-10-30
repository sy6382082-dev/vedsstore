'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/categories';

export function CategoryCards() {
  return (
    <section id="category-section" className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#737373] max-w-md">
            Explore our curated departments — authentic printer supplies, handcrafted bracelets, and versatile hand accessories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col bg-white border border-[#e5e5e5] rounded-lg overflow-hidden hover:border-[#171717] transition-colors duration-150"
            >
              <div className="relative aspect-[16/10] w-full bg-[#f5f5f5] overflow-hidden border-b border-[#e5e5e5]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-200"
                />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#171717] group-hover:underline">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#737373] mt-0.5">
                    {cat.description}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#e5e5e5] flex items-center justify-center text-[#171717] group-hover:bg-[#171717] group-hover:text-white transition-colors shrink-0 ml-3">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
