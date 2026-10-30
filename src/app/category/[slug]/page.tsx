'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  Package,
  Loader2,
} from 'lucide-react';
import { categories } from '@/data/categories';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const currentCategory = categories.find((c) => c.slug === slug);

  // Filter & Sort state
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sortMap: Record<string, { sort: string; order: string }> = {
        featured: { sort: 'featured', order: 'desc' },
        'price-asc': { sort: 'price', order: 'asc' },
        'price-desc': { sort: 'price', order: 'desc' },
        rating: { sort: 'rating', order: 'desc' },
      };
      const { sort, order } = sortMap[sortBy] ?? { sort: 'createdAt', order: 'desc' };

      const params = new URLSearchParams({
        category: slug,
        sort,
        order,
        maxPrice: String(maxPrice),
      });
      if (inStockOnly) params.set('inStock', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json() as { products: Product[] };
      setProducts(data.products ?? []);
    } catch {
      setError('Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [slug, sortBy, maxPrice, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (!currentCategory) {
    notFound();
  }

  const resetFilters = () => {
    setMaxPrice(5000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{currentCategory.name}</span>
        </nav>

        {/* Demo Data Notice Banner */}
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>⚠️ All prices, inventory quantities, and delivery estimates shown are demo data for presentation.</span>
          </div>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20">
            Phase 2 Demo
          </span>
        </div>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-10 shadow-lg border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl mb-2">
              {currentCategory.icon}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{currentCategory.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {currentCategory.description}. Browse authentic high-quality inventory curated specifically for Indian customers.
            </p>
            <div className="text-xs font-semibold text-amber-400 pt-1">
              {loading ? 'Loading products…' : `Showing ${products.length} products`}
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="text-xs"
          >
            <Filter className="w-4 h-4 mr-1.5" />
            {mobileFilterOpen ? 'Hide Filters' : 'Filter & Sort'}
          </Button>
          <span className="text-xs font-medium text-slate-500">
            {products.length} items
          </span>
        </div>

        {/* Main Layout Grid: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filter Sidebar */}
          <aside
            aria-label="Product Filters"
            className={`${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:block bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 lg:sticky lg:top-24`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                Refine Selection
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-2">
              <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="featured">Featured / Best Value</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
              </select>
            </div>

            {/* Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="price-range" className="uppercase tracking-wider text-slate-500 dark:text-slate-400">Max Price</label>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">{formatPrice(maxPrice)}</span>
              </div>
              <input
                id="price-range"
                type="range"
                min={200}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>₹200</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">In-Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                />
              </label>
            </div>

            {/* Other Categories Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Other Collections</span>
              <ul className="space-y-1.5 text-xs">
                {categories
                  .filter((c) => c.slug !== slug)
                  .map((other) => (
                    <li key={other.slug}>
                      <Link
                        href={`/category/${other.slug}`}
                        className="text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors flex items-center justify-between py-1"
                      >
                        <span>{other.name}</span>
                        <span className="text-slate-400">→</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center text-sm text-red-600 dark:text-red-400 space-y-3">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={fetchProducts}>Try Again</Button>
              </div>
            )}

            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">No products match your filters</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting the maximum price slider or disabling the in-stock filter.
                </p>
                <Button variant="gold" size="sm" onClick={resetFilters}>Clear All Filters</Button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading from database…
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
