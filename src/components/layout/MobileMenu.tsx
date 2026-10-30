'use client';

import React from 'react';
import Link from 'next/link';
import { X, Search } from 'lucide-react';
import { categories } from '@/data/categories';
import { SITE_NAME } from '@/lib/constants';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl p-5 flex flex-col justify-between border-r border-[#e5e5e5] animate-slide-up">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-[#171717]">
                {SITE_NAME}
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={onSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#171717] placeholder:text-[#737373] outline-none focus:border-[#171717] focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5 pointer-events-none" />
          </form>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] px-2 py-1">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-[#171717] hover:bg-[#f5f5f5] transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-[11px] text-[#737373]">{cat.productCount}</span>
              </Link>
            ))}

            <Link
              href="/search?q="
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-[#171717] hover:bg-[#f5f5f5] transition-colors"
            >
              <span>All Products</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
