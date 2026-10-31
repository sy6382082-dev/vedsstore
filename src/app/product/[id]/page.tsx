'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ChevronRight,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  Share2,
  ChevronDown,
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
        // Fetch related products
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
    showToast(`Added ${quantity} × ${product.name} to cart`, 'success');
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
        showToast('Added to wishlist', 'success');
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
      showToast('Product link copied to clipboard', 'info');
    }
  };

  const isLowStock = product?.stockCount !== undefined && product.stockCount < 10 && product.stockCount > 0;
  const inStock = product ? (product.inStock !== false && (product.stockCount === undefined || product.stockCount > 0)) : false;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-7 w-3/4 rounded" />
              <Skeleton className="h-5 w-1/2 rounded" />
              <Skeleton className="h-20 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[#737373] mt-4">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading product…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#737373] flex-wrap">
          <Link href="/" className="hover:text-[#171717] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/category/${getCategorySlug()}`} className="hover:text-[#171717] transition-colors capitalize">
            {getCategoryName()}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-[#171717] truncate max-w-xs sm:max-w-sm">{product.name}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Images Section (Left 6 Cols) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#fafafa] border border-[#e5e5e5]">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badge && <Badge variant="default">{product.badge}</Badge>}
              </div>
              {product.discount > 0 && (
                <div className="absolute top-3 right-3 bg-[#171717] text-white text-xs font-medium px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded overflow-hidden border transition-all shrink-0 ${
                      selectedImage === idx
                        ? 'border-[#171717]'
                        : 'border-[#e5e5e5] opacity-70 hover:opacity-100'
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
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs uppercase tracking-wider font-medium text-[#737373]">
                  {getCategoryName()} {product.subCategory ? `• ${product.subCategory}` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleShare}
                    className="p-1.5 rounded text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    className="p-1.5 rounded text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#171717] text-[#171717]' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#171717] leading-tight">
                {product.name}
              </h1>

              {/* SKU & Brand */}
              <div className="flex items-center gap-3 mt-2 text-xs text-[#737373]">
                {product.sku && <span>SKU: {product.sku}</span>}
                {product.sku && <span>•</span>}
                <span>Genuine Verified Item</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#171717]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-[#737373] line-through">
                    MRP {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-xs font-medium text-[#171717] bg-white border border-[#e5e5e5] px-2 py-0.5 rounded">
                    Save {product.discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373]">
                Inclusive of all taxes. Free delivery on orders over ₹499.
              </p>
              <div className="pt-1 text-xs">
                {inStock ? (
                  isLowStock ? (
                    <div className="inline-flex items-center gap-1.5 font-medium text-[#171717]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Only {product.stockCount} left in stock
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 font-medium text-[#171717]">
                      <Check className="w-3.5 h-3.5" />
                      In Stock — Ready to dispatch
                    </div>
                  )
                ) : (
                  <div className="inline-flex items-center gap-1.5 font-medium text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Currently Out of Stock
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">Overview</h3>
              <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">{product.description}</p>
            </div>

            {/* Bundle Components Breakdown */}
            {product.bundleComponents && product.bundleComponents.length > 0 && (
              <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
                    Bundle Includes ({product.bundleComponents.length} Items)
                  </h3>
                  <span className="text-[11px] text-[#737373]">1 of each</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.bundleComponents.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-2.5 p-2 rounded bg-white border border-[#e5e5e5] text-xs"
                    >
                      <div className="w-7 h-7 rounded bg-[#f5f5f5] shrink-0 overflow-hidden">
                        <img src={comp.image} alt={comp.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#171717] truncate">{comp.name}</div>
                        <div className="text-[10px] text-[#737373]">{comp.sku || comp.color}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#e5e5e5]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373]">Highlights</h3>
                <ul className="space-y-1 text-xs text-[#171717]">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#737373]">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="pt-4 border-t border-[#e5e5e5] space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-[#171717]">Quantity</span>
                <div className="flex items-center border border-[#e5e5e5] rounded bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-[#171717]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, product.stockCount || 10, q + 1))}
                    className="px-3 py-1.5 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1 font-medium text-xs h-10"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  <span>{inStock ? `Add to Cart • ${formatPrice(product.price * quantity)}` : 'Out of Stock'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  className="sm:w-auto text-xs h-10"
                >
                  <Heart className={`w-4 h-4 mr-1.5 ${inWishlist ? 'fill-[#171717] text-[#171717]' : ''}`} />
                  <span>{inWishlist ? 'Saved' : 'Wishlist'}</span>
                </Button>
              </div>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[
                { Icon: Truck, title: 'Express Delivery', sub: 'Orders over ₹499' },
                { Icon: RotateCcw, title: '7-Day Returns', sub: 'From delivery date' },
                { Icon: ShieldCheck, title: '100% Genuine', sub: 'Quality assured' },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5] text-center">
                  <Icon className="w-4 h-4 text-[#171717] mx-auto mb-1" />
                  <span className="block text-xs font-medium text-[#171717]">{title}</span>
                  <span className="text-[10px] text-[#737373]">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-10 bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
            <button
              onClick={() => setSpecsExpanded(!specsExpanded)}
              className="w-full p-4 text-left flex items-center justify-between font-semibold text-sm text-[#171717] hover:bg-[#fafafa] transition-colors"
            >
              <span>Specifications &amp; Details</span>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform ${specsExpanded ? 'rotate-180' : ''}`} />
            </button>
            {specsExpanded && (
              <div className="px-4 pb-4 border-t border-[#e5e5e5] pt-3">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-[#f5f5f5]">
                      <dt className="text-[#737373] font-normal">{key}</dt>
                      <dd className="text-[#171717] font-medium text-right">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#e5e5e5] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  Recommendations
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#171717] mt-0.5">Related Products</h2>
              </div>
              <Link href={`/category/${getCategorySlug()}`} className="text-xs font-medium text-[#171717] hover:underline">
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
