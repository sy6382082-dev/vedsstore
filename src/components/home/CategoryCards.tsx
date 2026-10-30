'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/data/categories';

export function CategoryCards() {
  return (
    <section id="category-section" className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Explore Our Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Handcrafted luxury bangles, versatile hand accessories, and authentic OEM ink bottles curated for discerning Indian shoppers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-xl shadow-md">
                  {cat.icon}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-medium text-amber-300">
                    {cat.productCount} Products
                  </span>
                  <h3 className="text-xl font-bold tracking-tight mt-0.5">
                    {cat.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between mt-auto">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {cat.description}
                </p>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-colors shrink-0 ml-3">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
