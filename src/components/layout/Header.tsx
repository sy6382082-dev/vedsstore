'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Menu,
  User,
  LogOut,
  Package,
  Heart,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SITE_NAME } from '@/lib/constants';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const router = useRouter();
  const { totalItems, openCart, isHydrated } = useCart();
  const { user, isLoading, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setAccountDropdownOpen(false);
    await logout();
    router.push('/');
  };

  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : '';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5] no-print">
        {/* Top Announcement Bar */}
        <div className="bg-[#f5f5f5] text-[#171717] text-xs py-1.5 px-4 text-center font-medium border-b border-[#e5e5e5]">
          <span>
            {SITE_NAME} • Everyday essentials, made simple. Free shipping on orders above ₹499
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Mobile hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-[#171717] hover:bg-[#f5f5f5]"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#171717] font-sans">
                  {SITE_NAME}
                </span>
              </Link>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products, inks, jewellery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-md bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#171717] focus:bg-white text-[#171717] placeholder:text-[#737373] transition-colors outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute left-3 top-2.5 text-[#737373] hover:text-[#171717] transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Account area */}
              <div className="relative" ref={dropdownRef}>
                {isLoading ? (
                  <div className="w-9 h-9 rounded-md bg-[#f5f5f5] animate-pulse" />
                ) : user ? (
                  <>
                    <button
                      onClick={() => setAccountDropdownOpen((v) => !v)}
                      aria-label="Account menu"
                      aria-expanded={accountDropdownOpen}
                      className="flex items-center gap-1.5 h-9 px-2.5 rounded-md text-[#171717] hover:bg-[#f5f5f5] transition-colors border border-transparent hover:border-[#e5e5e5]"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#171717] text-white font-semibold text-[11px] flex items-center justify-center">
                        {userInitials}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-[#737373] transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {accountDropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-md border border-[#e5e5e5] py-1.5 z-50">
                        <div className="px-4 py-2 border-b border-[#e5e5e5]">
                          <p className="text-xs font-semibold text-[#171717] truncate">
                            {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email}
                          </p>
                          <p className="text-[11px] text-[#737373] truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-[#737373]" />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-[#737373]" />
                          My Orders
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-[#737373]" />
                          Wishlist
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#737373]" />
                          Settings
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-[#f5f5f5] border-t border-[#e5e5e5]"
                          >
                            <Package className="w-3.5 h-3.5 text-[#171717]" />
                            Admin Console
                          </Link>
                        )}
                        <div className="border-t border-[#e5e5e5] mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-[#737373] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 h-9 px-3 rounded-md text-[#171717] hover:bg-[#f5f5f5] transition-colors text-xs font-medium border border-[#e5e5e5]"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                aria-label={`Open Cart (${isHydrated ? totalItems : 0} items)`}
                className="flex items-center gap-2 h-9 px-3.5 rounded-md bg-[#171717] text-white hover:bg-black font-medium text-xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="w-4 h-4 rounded-full bg-white text-[#171717] flex items-center justify-center text-[10px] font-bold">
                  {isHydrated ? totalItems : 0}
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-[#e5e5e5] text-xs font-medium text-[#737373]">
            <Link href="/category/bracelets" className="hover:text-[#171717] transition-colors py-1">
              Bracelets
            </Link>
            <Link href="/category/hand-accessories" className="hover:text-[#171717] transition-colors py-1">
              Hand Accessories
            </Link>
            <Link href="/category/printer-ink" className="hover:text-[#171717] transition-colors py-1">
              Printer Ink &amp; Cartridges
            </Link>
            <Link href="/search?q=" className="hover:text-[#171717] transition-colors py-1">
              All Products
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />
    </>
  );
}
