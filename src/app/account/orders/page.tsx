'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Truck,
  RotateCcw,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  notes?: string;
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

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; step: number }
> = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    step: 1,
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    step: 2,
  },
  packed: {
    label: 'Packed',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    step: 3,
  },
  shipped: {
    label: 'Shipped',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
    step: 4,
  },
  delivered: {
    label: 'Delivered',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    step: 5,
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
    step: 0,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchOrders = () => {
    fetch('/api/account/orders')
      .then((r) => r.json())
      .then((d: { orders?: Order[] }) => {
        setOrders(d.orders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? Reserved stock will be safely restored.')) {
      return;
    }

    setCancellingId(orderId);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/account/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setFeedbackMessage({
          type: 'success',
          text: data.message || 'Order successfully cancelled.',
        });
        fetchOrders();
      } else {
        setFeedbackMessage({
          type: 'error',
          text: data.error || 'Could not cancel order.',
        });
      }
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Network error occurred while cancelling order.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Orders</h1>
              <p className="text-xs text-slate-500">Track shipments, view invoices &amp; manage cancellations</p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize whitespace-nowrap transition-all ${
                  filterStatus === st
                    ? 'bg-[#0047BA] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-3xl skeleton" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {filterStatus === 'all'
                  ? 'No orders found'
                  : `No orders matching "${filterStatus}" status`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Explore our everyday essentials, supplies, and accessories.
              </p>
            </div>
            <div>
              <Link href="/">
                <Button variant="primary" size="sm" className="font-medium text-xs">
                  Browse Products →
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const canCancel = order.status === 'pending' || order.status === 'confirmed';

              let notesObj: Record<string, unknown> = {};
              try {
                if (order.notes) notesObj = JSON.parse(order.notes);
              } catch {
                notesObj = {};
              }

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs transition-all"
                >
                  {/* Order Top Strip */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusCfg.badge}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {formatPrice(order.grandTotal)}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary of Items */}
                  <div className="space-y-1.5 pt-1">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs text-slate-600 dark:text-slate-300"
                      >
                        <span className="font-medium">
                          {item.productName} <span className="text-slate-400">× {item.quantity}</span>
                        </span>
                        <span className="font-mono font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Expandable Order Details Drawer */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-slide-up">
                      {/* Delivery Address & Payment Mode */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" /> Delivery Address:
                          </span>
                          {order.shippingAddress ? (
                            <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              <p className="font-semibold">{order.shippingAddress.fullName}</p>
                              <p>{order.shippingAddress.addressLine1}</p>
                              {order.shippingAddress.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                              )}
                              <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                {order.shippingAddress.pincode}
                              </p>
                              <p className="font-mono text-slate-400 mt-1">
                                Mobile: +91 {order.shippingAddress.phone}
                              </p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400">Standard Delivery</p>
                          )}
                        </div>

                        <div className="space-y-1 sm:border-l sm:border-slate-200 dark:sm:border-slate-700 sm:pl-4">
                          <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-600" /> Fulfillment &amp; Payment:
                          </span>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                            <p>
                              Payment Mode:{' '}
                              <strong>
                                {notesObj.paymentMethod === 'RAZORPAY_TEST'
                                  ? 'Online Payment (Test Mode)'
                                  : 'Cash on Delivery (Pay on Delivery)'}
                              </strong>
                            </p>
                            <p>
                              Payment Status: <span className="capitalize">{order.paymentStatus}</span>
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Courier Tracking: Prepared for gateway dispatch
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Financial Detail Breakdown */}
                      <div className="space-y-1.5 text-xs text-slate-500 max-w-xs ml-auto pt-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span className="font-mono">
                            {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18% Included):</span>
                          <span className="font-mono">{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>Grand Total:</span>
                          <span className="font-mono text-sm text-[#0047BA] dark:text-blue-400">
                            {formatPrice(order.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> View Full Details &amp; Address
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/order-confirmation/${order.id}`}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Confirmation View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="px-2.5 py-1 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-bold transition-colors flex items-center gap-1 border border-red-200 dark:border-red-900/60"
                        >
                          {cancellingId === order.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" /> Cancelling…
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3" /> Cancel Order
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
