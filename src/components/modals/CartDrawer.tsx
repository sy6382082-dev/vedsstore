'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Shopping Cart Drawer"
          className="w-screen max-w-md bg-white shadow-xl flex flex-col border-l border-[#e5e5e5] animate-slide-in-right"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#e5e5e5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#f5f5f5] text-[#171717] rounded-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#171717]">Shopping Cart</h2>
                <p className="text-xs text-[#737373]">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-1.5 text-[#737373] hover:text-[#171717] rounded-md hover:bg-[#f5f5f5] transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#e5e5e5]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base text-[#171717]">Your cart is empty</h3>
                <p className="text-xs text-[#737373] max-w-xs">
                  Browse our catalog to add everyday essentials and accessories to your cart.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={closeCart}
                  className="mt-2"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-3.5 items-start">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 rounded-md object-cover bg-[#f5f5f5] border border-[#e5e5e5] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product.id}`}
                      onClick={closeCart}
                      className="font-medium text-xs sm:text-sm text-[#171717] line-clamp-1 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-[#737373] capitalize mt-0.5">
                      {product.category?.replace('-', ' ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-xs text-[#171717]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-[11px] text-[#737373] line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-[#e5e5e5] rounded bg-white">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] text-xs font-semibold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-medium text-[#171717]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] text-xs font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-xs text-[#737373] hover:text-[#171717] p-1 flex items-center gap-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#e5e5e5] bg-[#fafafa] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#737373]">Subtotal</span>
                <span className="font-semibold text-[#171717]">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#737373]">
                Taxes and shipping calculated at checkout.
              </p>

              <div className="space-y-2 pt-1">
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <Button variant="primary" size="md" className="w-full font-medium">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart} className="block w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Cart
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
