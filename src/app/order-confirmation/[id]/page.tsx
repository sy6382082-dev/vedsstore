'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle,
  Package,
  MapPin,
  Clock,
  Truck,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string | null;
  slug: string;
  isBundle: boolean;
  image: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  notes: {
    paymentMethod?: string;
    landmark?: string;
    customerPhone?: string;
    customerName?: string;
  };
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/account/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found or access denied');
        return res.json();
      })
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
        } else {
          setError('Order details not found.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load order.');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Retrieving your order confirmation…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Unable to Load Order</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || 'This order does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Link href="/account/orders">
              <Button variant="outline" size="sm" className="font-semibold text-xs">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
            <CheckCircle className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">
              Payment &amp; Inventory Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Your order has been recorded in the database. Stock has been atomically deducted, and your items are being prepared.
            </p>
          </div>

          {/* Key Reference Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
            <span className="text-slate-500">Order Number:</span>
            <strong className="text-slate-900 dark:text-white font-bold text-sm">
              #{order.orderNumber}
            </strong>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/account/orders">
              <Button variant="gold" size="md" className="font-bold text-xs flex items-center gap-1.5 shadow-sm">
                <Package className="w-4 h-4" />
                <span>Track in My Orders</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="md" className="text-xs font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Delivery Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Delivery Address</h2>
            </div>

            {order.shippingAddress ? (
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  <span className="font-mono font-semibold">{order.shippingAddress.pincode}</span>
                </p>
                <p className="pt-1 font-mono text-[11px] text-slate-500">
                  Contact Mobile: +91 {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Standard Delivery</p>
            )}
          </div>

          {/* Column 2: Payment & Fulfillment */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Truck className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Order Status &amp; Payment</h2>
            </div>

            <div className="text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Order Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order.notes?.paymentMethod === 'RAZORPAY_TEST'
                    ? 'Online Payment (Test Mode)'
                    : 'Cash on Delivery (Pay on Delivery)'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status:</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Pending (Pay upon doorstep delivery)
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Placed On:
                </span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Items in this Order ({order.items.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.sku && <span>SKU: {item.sku} • </span>}
                    Qty: <strong>{item.quantity}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                    {formatPrice(item.itemTotal)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatPrice(item.price)} each
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs max-w-xs ml-auto">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {order.shipping === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">FREE</span>
                ) : (
                  formatPrice(order.shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST (18% Included):</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {formatPrice(order.tax)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
              <span className="font-black text-sm text-slate-900 dark:text-white">Total Amount:</span>
              <span className="font-black text-xl text-[#0047BA] dark:text-blue-400 font-mono">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
