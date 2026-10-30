'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Package,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { categories } from '@/data/categories';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(paramQ);
  const [prevParamQ, setPrevParamQ] = useState(paramQ);

  if (paramQ !== prevParamQ) {
    setPrevParamQ(paramQ);
    setQuery(paramQ);
  }

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const sortMap: Record<string, { sort: string; order: string }> = {
        relevance: { sort: 'createdAt', order: 'desc' },
        'price-asc': { sort: 'price', order: 'asc' },
        'price-desc': { sort: 'price', order: 'desc' },
        rating: { sort: 'rating', order: 'desc' },
      };
      const { sort, order } = sortMap[sortBy] ?? { sort: 'createdAt', order: 'desc' };
      const params = new URLSearchParams({ sort, order, maxPrice: String(maxPrice) });
      if (paramQ.trim()) params.set('q', paramQ.trim());
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (inStockOnly) params.set('inStock', 'true');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json() as { products?: Product[] };
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [paramQ, selectedCategory, maxPrice, inStockOnly, sortBy]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setMaxPrice(5000);
    setInStockOnly(false);
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-amber-500 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Search Catalog
          </span>
        </nav>

        {/* Search Header Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Search Brother Store
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find brother ink bottles, epson ink, gold-plated bangles, henna cones, and grooming sets.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, OEM ink model, or keyword..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <Button
              type="submit"
              variant="gold"
              size="sm"
              className="absolute right-2 top-2 px-4 font-bold text-xs"
            >
              Search
            </Button>
          </form>

          {/* Quick Popular Searches */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Popular:
            </span>
            {['Brother BT5000', 'BTD60BK', 'Kundan', 'Mehndi', 'Epson 003', 'Silver Charm'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  router.push(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Filters Sidebar */}
          <aside
            aria-label="Search Filters"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                Filter Results
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

            {/* Category Filter */}
            <div className="space-y-2">
              <label htmlFor="search-cat-select" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category
              </label>
              <select
                id="search-cat-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.productCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <label htmlFor="search-sort-select" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sort By
              </label>
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price-asc' | 'price-desc' | 'rating')}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="search-price-range" className="uppercase tracking-wider text-slate-500 dark:text-slate-400">Max Price</label>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">{formatPrice(maxPrice)}</span>
              </div>
              <input
                id="search-price-range"
                type="range"
                min={150}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>₹150</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  In-Stock Only
                </span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
                />
              </label>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching database…</>
                ) : (
                  <>Found <strong className="text-slate-900 dark:text-white">{results.length}</strong> matching products{paramQ ? ` for "${paramQ}"` : ''}</>
                )}
              </p>
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            )}

            {!loading && results.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  No matching items found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  We couldn&apos;t find any items matching &ldquo;{query}&rdquo;. Try checking the spelling or resetting active filters.
                </p>
                <div className="pt-2">
                  <Button variant="gold" size="sm" onClick={resetFilters}>
                    Reset All Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
