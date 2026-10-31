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
  RotateCcw,
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
      <div className="min-h-screen bg-white flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#171717] animate-spin" />
          <p className="text-xs text-[#737373] font-medium">Retrieving your order confirmation…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8 border border-[#e5e5e5] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-[#171717]">Unable to Load Order</h1>
          <p className="text-xs text-[#737373]">
            {error || 'This order does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Link href="/account/orders">
              <Button variant="outline" size="sm" className="text-xs">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Success Header Banner */}
        <div className="bg-[#fafafa] rounded-lg p-6 sm:p-10 border border-[#e5e5e5] text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white border border-[#e5e5e5] text-[#171717] mx-auto flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-[#737373]">
              Confirmed Order
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
              Thank you for your order
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto">
              Your order has been recorded. Stock has been reserved and your items are being prepared.
            </p>
          </div>

          {/* Key Reference Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-[#e5e5e5] text-xs font-mono">
            <span className="text-[#737373]">Order Number:</span>
            <strong className="text-[#171717] font-semibold">
              #{order.orderNumber}
            </strong>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/account/orders">
              <Button variant="primary" size="md" className="text-xs flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>Track in My Orders</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="md" className="text-xs flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Delivery Details */}
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#e5e5e5] space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5e5]">
              <MapPin className="w-4 h-4 text-[#171717]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">Delivery Address</h2>
            </div>

            {order.shippingAddress ? (
              <div className="text-xs space-y-1 text-[#737373]">
                <p className="font-semibold text-[#171717] text-sm">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  <span className="font-mono text-[#171717]">{order.shippingAddress.pincode}</span>
                </p>
                <p className="pt-1 text-[#737373]">
                  Contact: +91 {order.shippingAddress.phone}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#737373]">Standard Delivery</p>
            )}
          </div>

          {/* Column 2: Payment & Fulfillment */}
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#e5e5e5] space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5e5]">
              <Truck className="w-4 h-4 text-[#171717]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">Status &amp; Payment</h2>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#737373]">Order Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#737373]">Payment Mode:</span>
                <span className="font-medium text-[#171717]">
                  {order.notes?.paymentMethod === 'RAZORPAY_TEST' || order.notes?.paymentMethod === 'RAZORPAY'
                    ? 'Online Payment (Razorpay)'
                    : 'Cash on Delivery'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#737373]">Payment Status:</span>
                <span className="font-medium text-[#171717] capitalize">
                  {order.paymentStatus}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 text-[11px] text-[#737373]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#171717]" /> Placed On:
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
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#e5e5e5] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#171717] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#171717]" />
              Items in this Order ({order.items.length})
            </h2>
          </div>

          <div className="divide-y divide-[#e5e5e5]">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded bg-[#f5f5f5] overflow-hidden shrink-0 border border-[#e5e5e5]">
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-[#171717] truncate">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    {item.sku && <span>SKU: {item.sku} • </span>}
                    Qty: <strong>{item.quantity}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-xs text-[#171717]">
                    {formatPrice(item.itemTotal)}
                  </div>
                  <div className="text-[10px] text-[#737373]">
                    {formatPrice(item.price)} each
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-3 border-t border-[#e5e5e5] space-y-1.5 text-xs max-w-xs ml-auto">
            <div className="flex justify-between text-[#737373]">
              <span>Subtotal:</span>
              <span className="font-medium text-[#171717]">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-[#737373]">
              <span>Delivery Fee:</span>
              <span className="font-medium text-[#171717]">
                {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-[#737373]">
              <span>GST (18% Included):</span>
              <span className="font-medium text-[#171717]">
                {formatPrice(order.tax)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#e5e5e5] flex justify-between items-baseline">
              <span className="font-semibold text-sm text-[#171717]">Total Paid:</span>
              <span className="font-bold text-lg text-[#171717]">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Return Policy & Support Banner */}
        <div className="bg-[#fafafa] rounded-lg p-4 sm:p-5 border border-[#e5e5e5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-[#171717] flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#171717]" /> 7-Day Return &amp; Replacement Guarantee
            </span>
            <p className="text-[#737373]">
              Need assistance with your delivered items? You can request a return or replacement within 7 calendar days of delivery.
            </p>
          </div>
          <Link
            href="/return-policy"
            className="text-xs font-medium text-[#171717] underline hover:no-underline shrink-0"
          >
            View Return Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
