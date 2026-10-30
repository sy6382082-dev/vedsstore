'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleClose = () => {
    setQuantity(1);
    setSelectedImage(0);
    onClose();
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity} × ${product.name} to cart!`, 'success');
    handleClose();
  };

  const handleWishlist = () => {
    showToast('Saved to wishlist (demo)', 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {product.badge && <Badge variant="gold">{product.badge}</Badge>}
                <Badge variant="demo">Demo Data</Badge>
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-amber-500 scale-95 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400">
                {product.category.replace('-', ' ')}
              </span>
              {product.subCategory && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{product.subCategory}</span>
                </>
              )}
            </div>

            <h2 id="quick-view-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{product.reviewCount} customer reviews</span>
            </div>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm sm:text-base text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md">
                {product.discount}% OFF
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inclusive of all taxes</p>

            {/* Stock status */}
            <div className="mt-3">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-4 h-4" />
                  In Stock {product.stockCount ? `(${product.stockCount} left)` : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Features preview */}
            <div className="mt-4 space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Key Highlights:
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                {product.features.slice(0, 3).map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>

            {/* Quantity + Actions */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center justify-between border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 w-full sm:w-32 bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 px-2"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="font-semibold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount || 10, q + 1))}
                  className="text-lg font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 px-2"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <Button
                variant="gold"
                className="flex-1 font-semibold"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </Button>

              <Button variant="outline" onClick={handleWishlist} aria-label="Add to wishlist">
                ♥
              </Button>
            </div>

            {/* Demo assurance note */}
            <div className="mt-4 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Free shipping on ₹499+ | 30-day simulated return guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
