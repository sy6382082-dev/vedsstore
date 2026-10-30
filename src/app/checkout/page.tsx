'use client';

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  Lock,
  MapPin,
  Package,
  Loader2,
  ChevronRight,
  CreditCard,
  Truck,
  Plus,
  ArrowRight,
  CheckCircle,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ValidatedItem {
  productId: string;
  slug: string;
  sku: string | null;
  name: string;
  isBundle: boolean;
  image: string;
  price: number;
  pricePaise: number;
  requestedQuantity: number;
  validatedQuantity: number;
  availableStock: number;
  inStock: boolean;
  itemTotal: number;
  components?: Array<{
    id: string;
    name: string;
    sku: string | null;
    color: string;
    stockCount: number;
    availableStock: number;
    inStock: boolean;
  }>;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface RazorpayPendingSession {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  keyId: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as unknown as { Razorpay: unknown }).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const idempotencySeed = useId();
  const { items, totalItems, clearCart } = useCart();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);

  // New address form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  // Payment method state ('COD' or 'RAZORPAY')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');

  // Server validated cart
  const [validatedData, setValidatedData] = useState<{
    items: ValidatedItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    grandTotal: number;
    errors: string[];
  } | null>(null);

  const [isValidating, setIsValidating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Interactive Sandbox Modal for test environment when official modal is simulated
  const [pendingRazorpaySession, setPendingRazorpaySession] = useState<RazorpayPendingSession | null>(null);
  const [isVerifyingOnlinePayment, setIsVerifyingOnlinePayment] = useState(false);

  // Auto-fill user name and phone from profile if available
  useEffect(() => {
    if (user) {
      if (user.firstName || user.lastName) {
        setFullName(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim());
      }
      if (user.phone) {
        setPhone(user.phone.replace(/\D/g, '').slice(-10));
      }
    }
  }, [user]);

  // Preload Razorpay checkout script
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Validate cart with server once user is authenticated
  useEffect(() => {
    if (!isAuthenticated || items.length === 0) return;

    let cancelled = false;
    async function validate() {
      setIsValidating(true);
      try {
        const payload = items.map((i) => ({
          productId: i.product.id || i.product.slug,
          quantity: i.quantity,
        }));

        const res = await fetch('/api/checkout/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payload }),
        });

        const data = await res.json();
        if (!cancelled && res.ok && data.validation) {
          setValidatedData(data.validation);
        }
      } catch (e) {
        console.error('Validation error', e);
      } finally {
        if (!cancelled) setIsValidating(false);
      }
    }

    validate();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, items]);

  // Load customer addresses
  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/account/addresses')
      .then((r) => r.json())
      .then((data) => {
        if (data.addresses && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
          if (data.addresses.length > 0) {
            const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else setSelectedAddressId(data.addresses[0].id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Verify Razorpay payment on server
  const handleVerifyPayment = async (
    paymentResponse: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      method?: string;
    },
    orderId: string
  ) => {
    setIsVerifyingOnlinePayment(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          method: paymentResponse.method || 'online',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Payment signature verification failed.');
        setIsVerifyingOnlinePayment(false);
        setPendingRazorpaySession(null);
        return;
      }

      // Success! Clear cart and route to confirmation
      clearCart();
      setPendingRazorpaySession(null);
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error('Verification error', err);
      setErrorMessage('Server error verifying payment. Please contact support.');
      setIsVerifyingOnlinePayment(false);
      setPendingRazorpaySession(null);
    }
  };

  // Handle cancelled or failed Razorpay session
  const handleCancelPayment = async (orderId: string, reason: string) => {
    setPendingRazorpaySession(null);
    setIsPlacingOrder(false);
    setErrorMessage(`Payment not completed: ${reason}. Your cart has been preserved.`);

    try {
      await fetch('/api/payment/razorpay/failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason,
        }),
      });
    } catch (e) {
      console.warn('Failed to report payment cancellation', e);
    }
  };

  // Handle order submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add products before placing an order.');
      return;
    }

    // Validation checks
    if (useNewAddress || addresses.length === 0) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage('Please enter the recipient full name.');
        return;
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMessage('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!addressLine1.trim() || addressLine1.trim().length < 4) {
        setErrorMessage('Please enter street address / house / building number.');
        return;
      }
      if (!city.trim()) {
        setErrorMessage('Please enter city.');
        return;
      }
      if (!/^\d{6}$/.test(pincode.trim())) {
        setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
        return;
      }
    } else if (!selectedAddressId) {
      setErrorMessage('Please select a delivery address or enter a new one.');
      return;
    }

    setIsPlacingOrder(true);

    const addressPayload = useNewAddress
      ? {
          fullName: fullName.trim(),
          phone: phone.replace(/\D/g, ''),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          landmark: landmark.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        }
      : undefined;

    // ─────────────────────────────────────────────────────────────────────────
    // OPTION A: CASH ON DELIVERY
    // ─────────────────────────────────────────────────────────────────────────
    if (paymentMethod === 'COD') {
      try {
        const payload = {
          addressId: useNewAddress ? undefined : selectedAddressId,
          shippingAddress: addressPayload,
          paymentMethod: 'COD',
          items: items.map((i) => ({
            productId: i.product.id || i.product.slug,
            quantity: i.quantity,
          })),
          idempotencyKey: `bro-order-${idempotencySeed}-${Date.now()}`,
        };

        const res = await fetch('/api/checkout/place-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to place order. Please review your details.');
          setIsPlacingOrder(false);
          return;
        }

        clearCart();
        router.push(`/order-confirmation/${data.order.id}`);
      } catch (err) {
        console.error('Order placement failed', err);
        setErrorMessage('Network error occurred while submitting order. Please try again.');
        setIsPlacingOrder(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OPTION B: SECURE RAZORPAY PAYMENT GATEWAY
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const res = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: useNewAddress ? undefined : selectedAddressId,
          shippingAddress: addressPayload,
          items: items.map((i) => ({
            productId: i.product.id || i.product.slug,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to initialize payment gateway.');
        setIsPlacingOrder(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      const hasRealRazorpay = scriptLoaded && (window as unknown as { Razorpay: unknown }).Razorpay;
      const isRealKey = data.keyId && data.keyId.startsWith('rzp_') && !data.keyId.includes('placeholder');

      if (hasRealRazorpay && isRealKey) {
        // Open Official Razorpay Checkout Modal
        interface RazorpayOptions {
          key: string;
          amount: number;
          currency: string;
          name: string;
          description: string;
          image: string;
          order_id: string;
          prefill: {
            name: string;
            email: string;
            contact: string;
          };
          theme: {
            color: string;
          };
          handler: (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => Promise<void>;
          modal: {
            ondismiss: () => Promise<void>;
          };
        }

        const options: RazorpayOptions = {
          key: data.keyId,
          amount: data.amount,
          currency: 'INR',
          name: 'Brother Store',
          description: `Order #${data.orderNumber}`,
          image: '/images/brother-ink-products.jpg',
          order_id: data.razorpayOrderId,
          prefill: {
            name: data.customer.name,
            email: data.customer.email,
            contact: data.customer.contact,
          },
          theme: {
            color: '#0047BA',
          },
          handler: async (response) => {
            await handleVerifyPayment(response, data.orderId);
          },
          modal: {
            ondismiss: async () => {
              await handleCancelPayment(data.orderId, 'User closed payment window');
            },
          },
        };

        const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: RazorpayOptions) => { on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void; open: () => void } }).Razorpay;
        const rzp = new RazorpayConstructor(options);

        rzp.on('payment.failed', async (failedRes) => {
          await handleCancelPayment(
            data.orderId,
            failedRes.error?.description || 'Payment was declined by bank or UPI'
          );
        });

        rzp.open();
        setIsPlacingOrder(false);
      } else {
        // Interactive Razorpay Test Sandbox for local verification & development
        setPendingRazorpaySession({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          keyId: data.keyId,
          customer: data.customer,
        });
        setIsPlacingOrder(false);
      }
    } catch (err) {
      console.error('Razorpay session initialization failed', err);
      setErrorMessage('Failed to connect with Razorpay payment service. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Guest State Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cart" className="hover:text-blue-600 transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Checkout Authentication
            </span>
          </nav>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0047BA] dark:text-blue-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Please log in or create an account to continue with your order.
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your shopping cart is preserved safely in your browser session. Sign in to your existing account or create a new profile to proceed with server validation, delivery address, and Razorpay payment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
              <Link
                href="/auth/login?redirect=/checkout"
                className="flex-1 py-3 px-5 rounded-2xl bg-[#0047BA] hover:bg-blue-700 text-white font-bold text-xs text-center transition-all shadow-md shadow-blue-600/20"
              >
                Sign In to Account
              </Link>
              <Link
                href="/auth/register?redirect=/checkout"
                className="flex-1 py-3 px-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-all"
              >
                Create Account
              </Link>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  Preserved Guest Cart ({totalItems} items)
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Safe in session
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {item.product.name} (×{item.quantity})
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-blue-600 transition-colors">
            Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Checkout &amp; Payment</span>
        </nav>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-xs text-red-800 dark:text-red-300 animate-slide-up">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <span className="font-bold">Payment / Checkout Notice:</span>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Details & Items (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: Customer & Delivery Address */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    1. Shipping Address &amp; Customer Details
                  </h2>
                  <div className="text-xs text-slate-500">
                    Logged in as: <strong className="text-slate-800 dark:text-slate-200">{user?.email}</strong>
                  </div>
                </div>

                {/* Saved addresses selection if available */}
                {addresses.length > 0 && !useNewAddress && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Choose Saved Delivery Address:
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(true)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Address
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-xs ${
                            selectedAddressId === addr.id
                              ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                              <span>{addr.fullName}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                              <br />
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          <div className="pt-2 text-[10px] text-slate-400 font-mono">
                            Mobile: {addr.phone}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) && (
                  <div className="space-y-4 pt-1">
                    {addresses.length > 0 && (
                      <div className="flex justify-between items-center pb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Entering New Delivery Address:
                        </span>
                        <button
                          type="button"
                          onClick={() => setUseNewAddress(false)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          ← Select From Saved Addresses
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          10-Digit Mobile Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full text-xs pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Street Address / Flat / Building No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="House/Office No., Street, Area"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Apartment, suite, unit"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Metro Station"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Mumbai"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          State *
                        </label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                          placeholder="400051"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Payment Method */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    2. Payment Method
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    UPI, Credit/Debit Cards, Net Banking &amp; COD are fully supported.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Razorpay Online Payment */}
                  <label
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          Pay Online via Razorpay
                        </span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                          Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Instant payment via <strong>UPI (GPay/PhonePe)</strong>, Credit/Debit Cards, Net Banking &amp; Wallets. Verified securely on server.
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted Checkout
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'COD'
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-600" />
                          Cash on Delivery (Pay on Delivery)
                        </span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Doorstep
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Pay with cash or UPI QR at your doorstep upon delivery. Zero advance commitment.
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ No advance payment required
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 3: Validated Items Review */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    3. Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
                  </h2>
                  {isValidating && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying stock...
                    </span>
                  )}
                </div>

                {validatedData?.errors && validatedData.errors.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1 text-xs text-amber-800 dark:text-amber-300">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Stock Alerts:
                    </div>
                    {validatedData.errors.map((err, idx) => (
                      <div key={idx}>• {err}</div>
                    ))}
                  </div>
                )}

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(validatedData?.items ?? []).map((item) => (
                    <div key={item.productId} className="py-3.5 flex gap-3 sm:gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          <span>
                            Qty: <strong>{item.validatedQuantity}</strong>
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              item.inStock
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                            }`}
                          >
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {item.isBundle && item.components && (
                          <div className="mt-1.5 p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 text-[10px] text-blue-900 dark:text-blue-300">
                            <span className="font-bold">4-Pack Contents: </span>
                            {item.components.map((c) => c.color).join(' • ')}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                          {formatPrice(item.itemTotal)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 sticky top-24">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                  Payment Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {formatPrice(validatedData?.subtotal ?? 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Standard Shipping</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {validatedData?.shipping === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                          FREE
                        </span>
                      ) : (
                        formatPrice(validatedData?.shipping ?? 49)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>GST (18% Included)</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {formatPrice(validatedData?.tax ?? 0)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Final Total
                    </span>
                    <span className="font-black text-xl text-[#0047BA] dark:text-blue-400 font-mono">
                      {formatPrice(validatedData?.grandTotal ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Brother Store Guarantee
                  </div>
                  <p>
                    Original OEM ink bottles with hologram seals. Payments encrypted via Razorpay with server verification.
                  </p>
                </div>

                {/* Final Button */}
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  disabled={isPlacingOrder || isValidating || !items.length}
                  className="w-full font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing…</span>
                    </>
                  ) : paymentMethod === 'RAZORPAY' ? (
                    <>
                      <span>Pay Now via Razorpay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Place Order (Cash on Delivery)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="pt-1 text-center">
                  <Link
                    href="/cart"
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ← Edit cart items
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* INTERACTIVE RAZORPAY TEST SANDBOX MODAL                             */}
      {/* (Presented in development/test mode for end-to-end verification)    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {pendingRazorpaySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-[#0047BA] dark:text-blue-400 tracking-tight">
                  Razorpay
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Test Sandbox
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleCancelPayment(pendingRazorpaySession.orderId, 'User closed sandbox modal')
                }
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Order Reference</p>
              <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                #{pendingRazorpaySession.orderNumber}
              </p>
              <p className="text-2xl font-black text-[#0047BA] dark:text-blue-400 font-mono pt-1">
                {formatPrice(pendingRazorpaySession.amount / 100)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold">{pendingRazorpaySession.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile:</span>
                <span className="font-mono">+91 {pendingRazorpaySession.customer.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Methods:</span>
                <span className="font-semibold text-blue-600">UPI • Cards • NetBanking</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              In test mode, choose an outcome to simulate. Payment signatures and webhooks are verified cryptographically via HMAC SHA-256 on the server.
            </p>

            <div className="space-y-2 pt-1">
              <Button
                variant="gold"
                size="md"
                disabled={isVerifyingOnlinePayment}
                onClick={async () => {
                  setIsVerifyingOnlinePayment(true);
                  try {
                    const paymentId = `pay_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
                    const sigRes = await fetch('/api/payment/razorpay/test-signature', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        orderId: pendingRazorpaySession.razorpayOrderId,
                        paymentId,
                      }),
                    });
                    const sigData = await sigRes.json();
                    if (!sigRes.ok || !sigData.signature) {
                      throw new Error(sigData.error || 'Failed to generate test signature');
                    }

                    await handleVerifyPayment(
                      {
                        razorpay_order_id: pendingRazorpaySession.razorpayOrderId,
                        razorpay_payment_id: paymentId,
                        razorpay_signature: sigData.signature,
                        method: 'upi',
                      },
                      pendingRazorpaySession.orderId
                    );
                  } catch (err) {
                    console.error('Test verification failed', err);
                    setErrorMessage('Failed to simulate test payment.');
                    setIsVerifyingOnlinePayment(false);
                  }
                }}
                className="w-full font-bold text-xs flex items-center justify-center gap-2"
              >
                {isVerifyingOnlinePayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Signature on Server…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Simulate Successful Payment (UPI)</span>
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCancelPayment(
                      pendingRazorpaySession.orderId,
                      'Simulated bank decline: insufficient funds or invalid OTP'
                    )
                  }
                  className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Simulate Bank Decline
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCancelPayment(pendingRazorpaySession.orderId, 'User cancelled payment')
                  }
                  className="text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
