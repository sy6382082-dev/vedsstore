'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
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
      <div className="min-h-screen bg-white py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[#171717] border-t-transparent animate-spin" />
          <p className="text-xs text-[#737373] font-medium">Loading your shopping cart…</p>
        </div>
      </div>
    );
  }

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
            Shopping Cart
          </span>
        </nav>

        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] flex items-center gap-3">
            <span>Your Shopping Cart</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
              {totalItems} items
            </span>
          </h1>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#737373] hover:text-[#171717] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-[#fafafa] rounded-lg p-12 sm:p-16 text-center border border-[#e5e5e5] space-y-3 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-white border border-[#e5e5e5] text-[#737373] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#171717]">
              Your cart is empty
            </h2>
            <p className="text-xs text-[#737373]">
              Explore our catalog to find everyday essentials, accessories, and supplies.
            </p>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" size="md">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Grid: Items (Left) + Order Summary (Right) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Table */}
            <div className="lg:col-span-8 bg-white rounded-lg border border-[#e5e5e5] overflow-hidden divide-y divide-[#e5e5e5]">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  {/* Product Details */}
                  <div className="flex gap-3.5 items-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover bg-[#f5f5f5] border border-[#e5e5e5] shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-medium tracking-wider text-[#737373]">
                        {product.category?.replace('-', ' ')}
                      </span>
                      <Link
                        href={`/product/${product.id}`}
                        className="block font-medium text-sm text-[#171717] hover:underline line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#171717]">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-[#737373] line-through text-[11px]">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Subtotal Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-[#f5f5f5]">
                    <div className="flex items-center border border-[#e5e5e5] rounded bg-white">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2.5 py-1 text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] text-xs font-semibold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-semibold text-[#171717]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2.5 py-1 text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] text-xs font-semibold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="block font-semibold text-sm text-[#171717]">
                        {formatPrice(product.price * quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-[11px] text-[#737373] hover:text-[#171717] hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
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
            <div className="lg:col-span-4 bg-[#fafafa] rounded-lg p-5 sm:p-6 border border-[#e5e5e5] space-y-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#171717] pb-3 border-b border-[#e5e5e5]">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#737373]">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-[#171717]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-[#737373]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#171717]" />
                    Shipping
                  </span>
                  <span className="font-medium text-[#171717]">
                    {shipping === 0 ? (
                      <span className="font-semibold text-[#171717]">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                {subtotal < 499 && (
                  <p className="text-[11px] text-[#737373] bg-white border border-[#e5e5e5] p-2 rounded">
                    Add {formatPrice(499 - subtotal)} more to qualify for <strong>FREE Delivery</strong>!
                  </p>
                )}

                <div className="flex justify-between text-[#737373]">
                  <span>Estimated GST (18% inclusive)</span>
                  <span className="font-medium text-[#171717]">
                    {formatPrice(tax)}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#e5e5e5] flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-semibold text-[#171717]">Total</span>
                    <span className="block text-[11px] text-[#737373]">Inclusive of all taxes</span>
                  </div>
                  <span className="text-xl font-bold text-[#171717]">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-medium text-xs h-10"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <div className="space-y-1.5 pt-2 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#171717] shrink-0" />
                  <span>Secure SSL Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-[#171717] shrink-0" />
                  <span>7-Day Return Guarantee (From Delivery)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
