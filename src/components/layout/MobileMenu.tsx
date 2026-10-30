'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sun, Moon, ShoppingBag, Search, Sparkles } from 'lucide-react';
import { categories } from '@/data/categories';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}: MobileMenuProps) {
  const { isDark, toggleTheme } = useTheme();
  const { totalItems, openCart, isHydrated } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 animate-slide-up">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight leading-none">
                <span className="text-[#0047BA] dark:text-blue-400">Brother</span>{' '}
                <span className="text-slate-900 dark:text-white">Store</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={onSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products, inks, jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{cat.icon}</span>
                  {cat.name}
                </span>
                <span className="text-xs text-slate-400">{cat.productCount}</span>
              </Link>
            ))}

            <Link
              href="/search?q=sale"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Special Offers & Deals
            </Link>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={() => {
              onClose();
              openCart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-between text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              View Cart
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
              {isHydrated ? totalItems : 0}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </span>
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-2">
            Brother Store India • Phase 2 Demo
          </p>
        </div>
      </div>
    </div>
  );
}
