'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
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
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Shopping Cart Drawer"
          className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in-right"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">Your Cart</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 dark:divide-slate-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Your cart is empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Looks like you haven&apos;t added any items yet. Explore our handcrafted jewellery or OEM inks!
                </p>
                <Button
                  variant="gold"
                  size="md"
                  onClick={closeCart}
                  className="mt-6"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-4 items-start">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product.id}`}
                      onClick={closeCart}
                      className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-amber-500 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                      {product.category.replace('-', ' ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-900 dark:text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping</span>
                  <span>{subtotal >= 499 ? 'FREE' : '₹49 at checkout'}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Taxes (GST)</span>
                  <span>Included in prices</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold text-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

