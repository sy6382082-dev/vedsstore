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
  Loader2,
} from 'lucide-react';
import { categories } from '@/data/categories';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';
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
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#737373]">
          <Link href="/" className="hover:text-[#171717] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-[#171717]">
            Search Catalog
          </span>
        </nav>

        {/* Search Header Form */}
        <div className="bg-[#fafafa] rounded-lg p-6 sm:p-8 border border-[#e5e5e5] space-y-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171717]">
              Search {SITE_NAME}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Find everyday essentials, OEM printer supplies, and accessories.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, model, or keyword..."
              className="w-full pl-9 pr-24 py-2.5 rounded-md bg-white border border-[#e5e5e5] text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors"
            />
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-3 pointer-events-none" />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-1.5 top-1.5 h-7 px-3 text-xs"
            >
              Search
            </Button>
          </form>

          {/* Quick Popular Searches */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#737373]">
            <span className="font-medium text-[#171717]">
              Popular:
            </span>
            {['Printer Ink', 'BT5000', 'Bracelets', 'Kundan', 'Hand Accessories'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  router.push(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="px-2 py-0.5 rounded bg-white border border-[#e5e5e5] text-[#171717] hover:border-[#171717] transition-colors cursor-pointer text-[11px]"
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
            className="bg-white rounded-lg p-5 border border-[#e5e5e5] space-y-5 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#171717]" />
                Filter Results
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#737373] hover:text-[#171717] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label htmlFor="search-cat-select" className="text-xs font-medium text-[#171717]">
                Category
              </label>
              <select
                id="search-cat-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-xs text-[#171717] focus:border-[#171717] outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-1.5">
              <label htmlFor="search-sort-select" className="text-xs font-medium text-[#171717]">
                Sort By
              </label>
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price-asc' | 'price-desc' | 'rating')}
                className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-xs text-[#171717] focus:border-[#171717] outline-none"
              >
                <option value="relevance">Relevance / Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {/* Price Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="search-price-range" className="text-[#171717] font-medium">Max Price</label>
                <span className="font-semibold text-[#171717]">{formatPrice(maxPrice)}</span>
              </div>
              <input
                id="search-price-range"
                type="range"
                min={200}
                max={5000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#171717] cursor-pointer h-1.5 bg-[#e5e5e5] rounded"
              />
              <div className="flex justify-between text-[11px] text-[#737373]">
                <span>₹200</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* In-Stock Toggle */}
            <div className="pt-3 border-t border-[#e5e5e5]">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-[#171717]">In-Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#171717] accent-[#171717] cursor-pointer"
                />
              </label>
            </div>
          </aside>

          {/* Product Results Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#737373]">
                {loading
                  ? 'Searching catalog…'
                  : `Found ${results.length} ${results.length === 1 ? 'product' : 'products'}${
                      paramQ ? ` for "${paramQ}"` : ''
                    }`}
              </span>
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="bg-[#fafafa] rounded-lg p-12 text-center border border-[#e5e5e5] space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-[#e5e5e5] text-[#737373] mx-auto flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-[#171717]">No products matched your search</h3>
                <p className="text-xs text-[#737373] max-w-sm mx-auto">
                  Try checking spelling, using more general keywords, or resetting filters.
                </p>
                <Button variant="primary" size="sm" onClick={resetFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}

            {!loading && results.length > 0 && (
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
        <div className="min-h-screen bg-white py-16 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#737373]">
            <Loader2 className="w-4 h-4 animate-spin text-[#171717]" />
            <span>Loading search…</span>
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
