'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { QuickViewModal } from '@/components/modals/QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart`, 'success');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showToast('Saved to wishlist (demo)', 'info');
  };

  const isLowStock = product.stockCount !== undefined && product.stockCount < 25;

  return (
    <>
      <div
        className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Product Image Area */}
        <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start pointer-events-none">
            {product.badge && (
              <Badge
                variant={
                  product.badge === 'Trending'
                    ? 'gold'
                    : product.badge === 'Sale'
                    ? 'coral'
                    : product.badge === 'Best Value'
                    ? 'emerald'
                    : 'blue'
                }
              >
                {product.badge}
              </Badge>
            )}
            <Badge variant="demo">Demo</Badge>
          </div>

          {/* Discount Pill */}
          {product.discount > 0 && (
            <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md pointer-events-none">
              {product.discount}% OFF
            </div>
          )}

          {/* Action Buttons (Quick View & Wishlist) */}
          <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5 transition-all duration-300 sm:opacity-0 sm:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 z-10">
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 shadow-md backdrop-blur-sm transition-all"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickView}
              aria-label="Quick view product"
              className="p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-amber-500 hover:bg-white dark:hover:bg-slate-800 shadow-md backdrop-blur-sm transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span>{product.category.replace('-', ' ')}</span>
            {isLowStock ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Only {product.stockCount} left!
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">In Stock</span>
            )}
          </div>

          <Link href={`/product/${product.id}`} className="block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <h3 className="font-semibold text-sm line-clamp-2 text-slate-900 dark:text-slate-100 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
                {product.rating}
              </span>
            </div>
            <span className="text-xs text-slate-400">({product.reviewCount})</span>
          </div>

          {/* Pricing */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-amber-400 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
