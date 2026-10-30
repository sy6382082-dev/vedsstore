'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, ShoppingBag, Heart, MapPin, Settings,
  LogOut, Package, ChevronRight, Star, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  items: { productName: string }[];
}

interface Props {
  user: {
    id: string;
    email: string;
    createdAt: string;
    profile: { firstName?: string | null; lastName?: string | null } | null;
    orders: Order[];
    addresses: { city: string; state: string }[];
    wishlist: { _count: { items: number } } | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function AccountDashboard({ user }: Props) {
  const router = useRouter();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountAgeDays, setAccountAgeDays] = useState(0);

  useEffect(() => {
    setAccountAgeDays(Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000));
  }, [user.createdAt]);

  const name = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.email.split('@')[0];
  const initials = name.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push('/');
  };

  const quickLinks = [
    { href: '/account/profile', icon: User, label: 'My Profile', desc: 'Name, email & phone' },
    { href: '/account/orders', icon: Package, label: 'My Orders', desc: `${user.orders.length} recent orders` },
    { href: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: `${user.wishlist?._count.items ?? 0} saved items` },
    { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: user.addresses[0] ? `${user.addresses[0].city}, ${user.addresses[0].state}` : 'No address saved' },
    { href: '/account/settings', icon: Settings, label: 'Settings', desc: 'Password & preferences' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hello, {name}! 👋</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: ShoppingBag, label: 'Orders', value: user.orders.length, color: 'text-blue-500' },
            { icon: Heart, label: 'Wishlist', value: user.wishlist?._count.items ?? 0, color: 'text-rose-500' },
            { icon: MapPin, label: 'Addresses', value: 1, color: 'text-amber-500' },
            { icon: Star, label: 'Days with us', value: accountAgeDays < 1 ? 'Today' : accountAgeDays, color: 'text-emerald-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">My Account</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Recent Orders</h2>
              <Link href="/account/orders" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">View all</Link>
            </div>
            {user.orders.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No orders yet</p>
                <Link href="/" className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">Start shopping →</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {user.orders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">#{order.orderNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {order.items[0]?.productName ?? 'Order item'}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.grandTotal / 100)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

