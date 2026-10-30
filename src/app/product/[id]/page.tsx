'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  Share2,
  ChevronDown,
  Info,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const productId = unwrappedParams.id;

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [specsExpanded, setSpecsExpanded] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Fetch product from DB
  useEffect(() => {
    setLoading(true);
    setNotFoundError(false);
    fetch(`/api/products/${productId}`)
      .then((r) => {
        if (r.status === 404) { setNotFoundError(true); return null; }
        return r.json();
      })
      .then((data: { product?: Product } | null) => {
        if (!data?.product) { setLoading(false); return; }
        setProduct(data.product);
        setLoading(false);
        // Fetch related products — the API embeds category as { slug, name }
        const catField = (data.product as unknown as Record<string, unknown>).category;
        const slug = typeof catField === 'object' && catField !== null
          ? (catField as { slug: string }).slug
          : String(catField);
        fetch(`/api/products?category=${slug}&sort=rating&order=desc`)
          .then((r) => r.json())
          .then((rd: { products?: Product[] }) => {
            setRelatedProducts((rd.products ?? []).filter((p) => p.id !== productId).slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(() => { setNotFoundError(true); setLoading(false); });
  }, [productId]);

  if (notFoundError) notFound();

  const getCategorySlug = () => {
    if (!product) return '#';
    const cat = (product as unknown as Record<string, unknown>).category;
    if (typeof cat === 'object' && cat !== null) return (cat as { slug: string }).slug ?? '#';
    return String(cat);
  };

  const getCategoryName = () => {
    if (!product) return '';
    const cat = (product as unknown as Record<string, unknown>).category;
    if (typeof cat === 'object' && cat !== null) {
      return (cat as { name?: string; slug?: string }).name ?? (cat as { slug?: string }).slug ?? '';
    }
    return String(cat).replace(/-/g, ' ');
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    showToast(`Added ${quantity} × ${product.name} to cart!`, 'success');
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!user) {
      showToast('Sign in to save items to your wishlist', 'info');
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await fetch('/api/account/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json() as { action?: string };
      if (data.action === 'added') {
        setInWishlist(true);
        showToast('Added to wishlist!', 'success');
      } else {
        setInWishlist(false);
        showToast('Removed from wishlist', 'info');
      }
    } catch {
      showToast('Could not update wishlist', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const isLowStock = product?.stockCount !== undefined && product.stockCount < 30;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <Skeleton className="aspect-square w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-6 w-1/2 rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-4">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading product from database…
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/category/${getCategorySlug()}`} className="hover:text-amber-500 transition-colors capitalize">
            {getCategoryName()}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-sm">{product.name}</span>
        </nav>

        {/* Demo Data Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>📋 Demo Data — Prices, stock and availability shown are illustrative only for Brother Store.</span>
          </div>
          <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20">
            Simulated Inventory
          </span>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Images Section (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && <Badge variant="gold">{product.badge}</Badge>}
                <Badge variant="demo">Demo Data</Badge>
              </div>
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-amber-500 scale-95 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section (Right 6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
                  {getCategoryName()} {product.subCategory ? `• ${product.subCategory}` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    className={`p-2 rounded-xl transition-colors ${
                      inWishlist
                        ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                        : 'text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Based on {product.reviewCount} verified ratings
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">100% Verified</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                <span className="text-base text-slate-400 line-through">MRP {formatPrice(product.originalPrice)}</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/80 px-2 py-0.5 rounded-md">
                  {product.discount}% OFF
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inclusive of all taxes (GST included). Free Express Shipping on orders over ₹499.
              </p>
              <div className="pt-2">
                {product.inStock ? (
                  isLowStock ? (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      Hurry, only {product.stockCount} left in stock!
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4" />
                      In Stock (Ready to dispatch)
                    </div>
                  )
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    Currently Out of Stock
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Bundle Components Breakdown */}
            {product.bundleComponents && product.bundleComponents.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    Bundle Contents ({product.bundleComponents.length} Genuine Items Included)
                  </h3>
                  <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-semibold">
                    1 Unit of Each
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.bundleComponents.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 text-xs shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={comp.image} alt={comp.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {comp.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{comp.sku}</span>
                          <span>•</span>
                          <span>{comp.color}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        comp.inStock
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}>
                        {comp.inStock ? `${comp.stockCount} left` : 'Out'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 italic">
                  ℹ️ Virtual Bundle Stock: Pack availability is dynamically determined by the lowest component stock. No duplicate physical stock is held.
                </p>
              </div>
            )}

            {/* Features */}
            {product.features.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Features</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + Cart */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    aria-label="Decrease quantity"
                  >-</button>
                  <span className="px-4 text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, product.stockCount || 10, q + 1))}
                    className="px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="gold"
                  size="lg"
                  className="flex-1 font-bold text-sm shadow-md shadow-amber-500/20"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart ({formatPrice(product.price * quantity)})
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="sm:w-auto"
                >
                  <Heart className={`w-4 h-4 mr-2 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-red-500'}`} />
                  {inWishlist ? 'Wishlisted' : 'Wishlist'}
                </Button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { Icon: Truck, title: 'Free Express', sub: 'On ₹499+ Orders' },
                { Icon: RotateCcw, title: '30-Day Return', sub: 'Easy Exchanges' },
                { Icon: ShieldCheck, title: '100% Authentic', sub: 'Brand Certified' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <Icon className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">{title}</span>
                  <span className="text-[10px] text-slate-400">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications (Expandable) */}
        {Object.keys(product.specifications).length > 0 && (
          <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <button
              onClick={() => setSpecsExpanded(!specsExpanded)}
              className="w-full p-6 text-left flex items-center justify-between font-bold text-base sm:text-lg text-slate-900 dark:text-white hover:text-amber-500 transition-colors"
            >
              <span>Product Specifications &amp; Technical Details</span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${specsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {specsExpanded && (
              <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                      <dt className="text-slate-500 dark:text-slate-400 font-medium">{key}</dt>
                      <dd className="text-slate-900 dark:text-white font-semibold text-right">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Recommended For You
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">Related Products</h2>
              </div>
              <Link href={`/category/${getCategorySlug()}`} className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                View all in {getCategoryName()} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
