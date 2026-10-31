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
  Package,
  Loader2,
} from 'lucide-react';
import { categories } from '@/data/categories';
import { products as fallbackProducts } from '@/data/products';
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

  // Data state with immediate fallback population
  const [products, setProducts] = useState<Product[]>(() =>
    fallbackProducts.filter((p) => p.category?.toLowerCase() === slug?.toLowerCase())
  );
  const [loading, setLoading] = useState(false);
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

      const queryParams = new URLSearchParams({
        category: slug,
        sort,
        order,
        maxPrice: String(maxPrice),
      });
      if (inStockOnly) queryParams.set('inStock', 'true');

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { products: Product[] };
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          return;
        }
      }

      // Fallback filtering if DB returned empty or had an issue
      let fallbackList = fallbackProducts.filter(
        (p) => p.category?.toLowerCase() === slug.toLowerCase()
      );
      fallbackList = fallbackList.filter((p) => p.price <= maxPrice);
      if (inStockOnly) fallbackList = fallbackList.filter((p) => p.inStock);
      if (sortBy === 'price-asc') fallbackList.sort((a, b) => a.price - b.price);
      else if (sortBy === 'price-desc') fallbackList.sort((a, b) => b.price - a.price);
      else if (sortBy === 'rating') fallbackList.sort((a, b) => b.rating - a.rating);
      setProducts(fallbackList);
    } catch {
      // Gracefully preserve filtered fallback
      let fallbackList = fallbackProducts.filter(
        (p) => p.category?.toLowerCase() === slug.toLowerCase()
      );
      fallbackList = fallbackList.filter((p) => p.price <= maxPrice);
      if (inStockOnly) fallbackList = fallbackList.filter((p) => p.inStock);
      setProducts(fallbackList);
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
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#737373]">
          <Link href="/" className="hover:text-[#171717] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-[#171717]">{currentCategory.name}</span>
        </nav>

        {/* Category Header */}
        <div className="rounded-lg bg-[#fafafa] border border-[#e5e5e5] p-6 sm:p-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
              Department
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              {currentCategory.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              {currentCategory.description}. Sourced with high standards for dependability and value.
            </p>
            <div className="text-xs font-medium text-[#171717] pt-1">
              {loading ? 'Updating catalog…' : `Showing ${products.length} products`}
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-white p-3.5 rounded-lg border border-[#e5e5e5]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="text-xs"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            {mobileFilterOpen ? 'Hide Filters' : 'Filter & Sort'}
          </Button>
          <span className="text-xs text-[#737373]">
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
            } lg:block bg-white rounded-lg p-5 border border-[#e5e5e5] space-y-5 lg:sticky lg:top-24`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#171717]" />
                Filters
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

            {/* Sort Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="sort-select" className="text-xs font-medium text-[#171717]">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')}
                className="w-full px-3 py-2 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-xs text-[#171717] focus:border-[#171717] outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

            {/* Price Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="price-range" className="text-[#171717] font-medium">Max Price</label>
                <span className="font-semibold text-[#171717]">{formatPrice(maxPrice)}</span>
              </div>
              <input
                id="price-range"
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

            {/* Other Categories Links */}
            <div className="pt-4 border-t border-[#e5e5e5] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">Other Categories</span>
              <ul className="space-y-1 text-xs">
                {categories
                  .filter((c) => c.slug !== slug)
                  .map((other) => (
                    <li key={other.slug}>
                      <Link
                        href={`/category/${other.slug}`}
                        className="text-[#737373] hover:text-[#171717] hover:underline flex items-center justify-between py-1"
                      >
                        <span>{other.name}</span>
                        <span>→</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {error && (
              <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-6 text-center text-xs text-red-600 space-y-3">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={fetchProducts}>Try Again</Button>
              </div>
            )}

            {loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="bg-[#fafafa] rounded-lg p-12 text-center border border-[#e5e5e5] space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-[#e5e5e5] text-[#737373] mx-auto flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-[#171717]">No products match your filters</h3>
                <p className="text-xs text-[#737373] max-w-sm mx-auto">
                  Try adjusting the maximum price slider or clearing filters.
                </p>
                <Button variant="primary" size="sm" onClick={resetFilters}>Clear All Filters</Button>
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
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#737373]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading products…</span>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
