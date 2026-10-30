'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  User,
  Sparkles,
  LogOut,
  Package,
  Heart,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { totalItems, openCart, isHydrated } = useCart();
  const { user, isLoading, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header
        className={`sticky top-0 z-40 transition-all duration-300 no-print ${
          isScrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border-b border-slate-200/80 dark:border-slate-800'
            : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Top Announcement Bar */}
        <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Festive Savings: Free Shipping on all orders above ₹499 |{' '}
            <strong className="text-amber-400">Demo Store</strong>
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Mobile hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex flex-col">
                  <span className="font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white leading-none group-hover:opacity-90 transition-opacity font-sans">
                    <span className="text-[#0047BA] dark:text-blue-400">Brother</span>{' '}
                    <span>Store</span>
                  </span>
                  <span className="text-[9px] tracking-widest uppercase font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                    Printer Ink &amp; Supplies
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search bracelets, hand accessories, brother ink..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute left-3.5 top-2.5 text-slate-400 hover:text-amber-500 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>

              {/* Account area */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                {isLoading ? (
                  <div className="p-2.5 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : user ? (
                  <>
                    <button
                      onClick={() => setAccountDropdownOpen((v) => !v)}
                      aria-label="Account menu"
                      aria-expanded={accountDropdownOpen}
                      className="flex items-center gap-1.5 p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                        {userInitials}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {accountDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-slide-up">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5" />
                          My Orders
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          Wishlist
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Settings
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            Admin Console
                          </Link>
                        )}
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                    className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={openCart}
                aria-label={`Open Cart (${isHydrated ? totalItems : 0} items)`}
                className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-amber-400 transition-all shadow-sm active:scale-95 ml-1"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="w-5 h-5 rounded-full bg-amber-500 dark:bg-slate-900 text-slate-950 dark:text-white flex items-center justify-center text-[10px] font-black">
                  {isHydrated ? totalItems : 0}
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Link href="/category/bracelets" className="hover:text-amber-500 transition-colors py-1">
              Bracelets
            </Link>
            <Link href="/category/hand-accessories" className="hover:text-amber-500 transition-colors py-1">
              Hand Accessories
            </Link>
            <Link href="/category/printer-ink" className="hover:text-amber-500 transition-colors py-1">
              Printer Ink &amp; Cartridges
            </Link>
            <Link href="/search?q=sale" className="text-red-500 hover:text-red-600 transition-colors py-1 flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Sale &amp; Deals
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
