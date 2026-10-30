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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/account" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Wishlist</h1>
          {items.length > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">{items.length} items</span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-2xl skeleton" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Your wishlist is empty</p>
            <Link href="/" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">Browse products →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(({ productId, product }) => (
              <div key={productId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex gap-4">
                <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Link href={`/product/${product.id}`} className="text-xs font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-2">{product.name}</Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && <span className="text-xs text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { addToCart(product); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(productId)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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

