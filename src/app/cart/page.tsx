'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    tax,
    grandTotal,
    totalItems,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

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
            Shopping Cart
          </span>
        </nav>

        {/* Demo Notice Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              📋 Demo Store: You can adjust quantities and simulate checkout. No actual bank charges will occur.
            </span>
          </div>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20">
            Phase 1
          </span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-amber-500" />
            Your Shopping Cart
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {totalItems} items
            </span>
          </h1>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Your cart is completely empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore our trending Brother ink refill bottles, handcrafted Kundan bangles, and bridal nail accessories to fill it up!
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button variant="gold" size="md" className="font-bold">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Grid: Items (Left) + Order Summary (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Table */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  {/* Product Details */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                        {product.category.replace('-', ' ')}
                      </span>
                      <Link
                        href={`/product/${product.id}`}
                        className="block font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                          In Stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Subtotal Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 dark:text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="block font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {formatPrice(product.price * quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-[11px] text-red-500 hover:underline mt-0.5 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (Right) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Cart Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-500" />
                    Express Shipping
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {subtotal < 499 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                    Add {formatPrice(499 - subtotal)} more to qualify for <strong>FREE Delivery</strong>!
                  </p>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated GST (18% inclusive)</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatPrice(tax)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-slate-900 dark:text-white">Grand Total</span>
                    <span className="block text-[11px] text-slate-400">Inclusive of all taxes</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full font-bold shadow-md"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Hassle-Free 30-Day Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
