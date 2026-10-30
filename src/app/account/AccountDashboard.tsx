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
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-md bg-[#171717] text-white flex items-center justify-center font-bold text-base">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#171717]">Hello, {name}</h1>
              <p className="text-xs text-[#737373]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors cursor-pointer border border-[#e5e5e5]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: ShoppingBag, label: 'Orders', value: user.orders.length },
            { icon: Heart, label: 'Wishlist', value: user.wishlist?._count.items ?? 0 },
            { icon: MapPin, label: 'Saved Addresses', value: user.addresses.length || 0 },
            { icon: Star, label: 'Days with VED-HUB', value: accountAgeDays < 1 ? 'New' : accountAgeDays },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-lg p-4 border border-[#e5e5e5]">
              <Icon className="w-4 h-4 text-[#171717] mb-2" />
              <div className="text-2xl font-bold text-[#171717]">{value}</div>
              <div className="text-xs text-[#737373] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
            <div className="p-4 border-b border-[#e5e5e5]">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-[#171717]">Account Navigation</h2>
            </div>
            <div className="divide-y divide-[#e5e5e5]">
              {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href} className="flex items-center gap-3 p-3.5 hover:bg-[#f5f5f5] transition-colors group">
                  <div className="w-7 h-7 rounded bg-[#f5f5f5] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                    <Icon className="w-3.5 h-3.5 text-[#171717]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#171717]">{label}</div>
                    <div className="text-[11px] text-[#737373] truncate">{desc}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#171717] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
            <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h2 className="font-semibold text-xs uppercase tracking-wider text-[#171717]">Recent Orders</h2>
              <Link href="/account/orders" className="text-xs text-[#737373] hover:text-[#171717] hover:underline">View all</Link>
            </div>
            {user.orders.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <ShoppingBag className="w-8 h-8 text-[#737373] mx-auto" />
                <p className="text-xs text-[#737373]">No orders yet</p>
                <Link href="/" className="text-xs text-[#171717] hover:underline font-medium inline-block">Start shopping →</Link>
              </div>
            ) : (
              <div className="divide-y divide-[#e5e5e5]">
                {user.orders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#171717] font-mono">#{order.orderNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium capitalize bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] truncate">
                        {order.items[0]?.productName ?? 'Order item'}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-[#737373]">
                        <Clock className="w-3 h-3 text-[#737373]" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-[#171717]">{formatPrice(order.grandTotal / 100)}</div>
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
