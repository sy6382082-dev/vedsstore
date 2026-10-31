'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Check } from 'lucide-react';
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
    showToast(`Added ${quantity} × ${product.name} to cart`, 'success');
    handleClose();
  };

  const inStock = product.inStock !== false && (product.stockCount === undefined || product.stockCount > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-[#e5e5e5] rounded-lg shadow-xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1.5 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Images Section */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#f5f5f5] border border-[#e5e5e5]">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                {product.badge && <Badge variant="default">{product.badge}</Badge>}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-14 h-14 rounded overflow-hidden border transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-[#171717]'
                        : 'border-[#e5e5e5] opacity-70 hover:opacity-100'
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
            <div className="text-xs uppercase tracking-wider text-[#737373] mb-1 font-medium">
              {product.category?.replace('-', ' ')}
            </div>

            <h2 id="quick-view-title" className="text-lg sm:text-xl font-bold text-[#171717]">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-xl sm:text-2xl font-bold text-[#171717]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs sm:text-sm text-[#737373] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs font-medium text-[#171717] bg-[#f5f5f5] border border-[#e5e5e5] px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <p className="text-xs text-[#737373] mt-1">Inclusive of all taxes</p>

            {/* Stock status */}
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <Check className="w-3.5 h-3.5 text-[#171717]" />
              <span className="text-[#171717] font-medium">
                {inStock ? 'In Stock — Ready to ship' : 'Out of stock'}
              </span>
            </div>

            <p className="text-xs text-[#737373] mt-3 line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Add to cart section */}
            <div className="mt-6 pt-4 border-t border-[#e5e5e5] space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#171717]">Quantity:</span>
                <div className="flex items-center border border-[#e5e5e5] rounded bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#171717]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                  className="flex-1 font-medium text-xs"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>

                <Link href={`/products/${product.slug || product.id}`} onClick={handleClose}>
                  <Button variant="outline" size="md" className="text-xs">
                    Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
