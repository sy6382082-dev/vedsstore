'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Eye } from 'lucide-react';
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

  const isLowStock = product.stockCount !== undefined && product.stockCount < 10 && product.stockCount > 0;
  const inStock = product.inStock !== false && (product.stockCount === undefined || product.stockCount > 0);

  return (
    <>
      <div className="group relative flex flex-col bg-white border border-[#e5e5e5] rounded-lg overflow-hidden hover:border-[#171717] transition-colors duration-150">
        {/* Product Image Area */}
        <div className="relative aspect-square w-full bg-[#f9f9f9] overflow-hidden border-b border-[#e5e5e5]">
          <Link href={`/products/${product.slug || product.id}`} className="block w-full h-full">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-200"
              loading="lazy"
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none">
            {product.badge && (
              <Badge variant="default" size="sm">
                {product.badge}
              </Badge>
            )}
            {!inStock && (
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-[#171717] text-white rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Discount Tag */}
          {product.discount > 0 && (
            <div className="absolute top-2.5 right-2.5 bg-[#171717] text-white text-[11px] font-medium px-2 py-0.5 rounded pointer-events-none">
              {product.discount}% OFF
            </div>
          )}

          {/* Quick View Button */}
          <button
            onClick={handleQuickView}
            aria-label="Quick view product"
            className="absolute bottom-2.5 right-2.5 p-2 rounded bg-white text-[#171717] border border-[#e5e5e5] hover:bg-[#f5f5f5] shadow-xs transition-opacity sm:opacity-0 group-hover:opacity-100"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#737373] uppercase tracking-wide mb-1 font-medium">
              <span>{product.category?.replace('-', ' ')}</span>
              {isLowStock ? (
                <span className="text-[#171717] font-medium">Only {product.stockCount} left</span>
              ) : inStock ? (
                <span className="text-[#737373]">In Stock</span>
              ) : null}
            </div>

            <Link href={`/products/${product.slug || product.id}`} className="block hover:underline">
              <h3 className="font-medium text-sm text-[#171717] line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="pt-2 border-t border-[#f0f0f0] flex flex-col gap-3">
            {/* Pricing */}
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-[#171717]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-[#737373] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Actions: View Details & Add to Cart */}
            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product.slug || product.id}`}
                className="flex-1 h-9 rounded border border-[#e5e5e5] hover:border-[#171717] text-[#171717] text-xs font-medium flex items-center justify-center transition-colors text-center"
              >
                View Details
              </Link>
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                aria-label={`Add ${product.name} to cart`}
                className="flex-1 h-9 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 disabled:bg-[#e5e5e5] disabled:text-[#737373] disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>
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
