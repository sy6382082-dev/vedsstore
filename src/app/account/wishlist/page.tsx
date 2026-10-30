'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface WishlistItem {
  id: string;
  productId: string;
  product: Product & { price: number; originalPrice: number; images: string[] };
}

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    fetch('/api/account/wishlist')
      .then((r) => r.json())
      .then((d: { items?: WishlistItem[] }) => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId: string) => {
    await fetch('/api/account/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/account" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">My Wishlist</h1>
          {items.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 font-medium">
              {items.length} items
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-xl skeleton" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3">
            <Heart className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-sm font-semibold text-neutral-700">Your wishlist is empty</p>
            <Link href="/" className="inline-block text-xs text-neutral-900 underline font-medium hover:text-neutral-600">
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(({ productId, product }) => (
              <div key={productId} className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-4 shadow-xs">
                <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-lg object-cover bg-neutral-50 shrink-0 border border-neutral-100" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Link href={`/product/${product.id}`} className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-2">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-neutral-400 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addToCart(product); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(productId)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-50 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
