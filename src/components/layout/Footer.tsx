'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Send,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { SITE_NAME, CONTACT_PHONE, CONTACT_EMAIL, ADDRESS } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';

export function Footer() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Subscribed successfully! Welcome to Brother Store insider perks.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs no-print">
      {/* Main 5-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Logo & Tagline */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-black text-2xl tracking-tight text-white">
                <span className="text-blue-400">Brother</span> Store
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              India&apos;s premier online marketplace for curated handcrafted bracelets, exquisite hand accessories, and original certified printer supplies.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              {/* Instagram SVG */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg bg-slate-800 hover:text-amber-400 hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* Twitter SVG */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-lg bg-slate-800 hover:text-amber-400 hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Facebook SVG */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-lg bg-slate-800 hover:text-amber-400 hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
                </svg>
              </a>
              {/* YouTube SVG */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-lg bg-slate-800 hover:text-amber-400 hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white tracking-wide uppercase text-[11px]">
              Categories
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/category/bracelets" className="hover:text-amber-400 transition-colors">
                  Bracelets &amp; Bangles
                </Link>
              </li>
              <li>
                <Link href="/category/hand-accessories" className="hover:text-amber-400 transition-colors">
                  Hand Accessories
                </Link>
              </li>
              <li>
                <Link href="/category/printer-ink" className="hover:text-amber-400 transition-colors">
                  Printer Ink &amp; Cartridges
                </Link>
              </li>
              <li>
                <Link href="/search?q=brother" className="hover:text-amber-400 transition-colors">
                  Brother Ink Bottles
                </Link>
              </li>
              <li>
                <Link href="/search?q=kundan" className="hover:text-amber-400 transition-colors">
                  Kundan Jewellery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white tracking-wide uppercase text-[11px]">
              Customer Service
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#faq-section" className="hover:text-amber-400 transition-colors">
                  Help &amp; FAQs
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-amber-400 transition-colors">
                  Returns &amp; Exchanges
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-amber-400 transition-colors">
                  Shipping &amp; Delivery Policy
                </a>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Track Your Order (Phase 2)
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Warranty Claim Support
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white tracking-wide uppercase text-[11px]">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#contact-section" className="hover:text-amber-400 transition-colors">
                  About Brother Store
                </a>
              </li>
              <li>
                <a href="#contact-section" className="hover:text-amber-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-amber-400 transition-colors">
                  Privacy Policy (DPDP Act)
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Secure Checkout
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white tracking-wide uppercase text-[11px]">
              Stay In The Loop
            </h4>
            <p className="text-slate-400 text-xs">
              Subscribe to get exclusive festival discount alerts, new arrival previews, and secret flash deals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-2 top-2 text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Zero spam. You can unsubscribe with one click anytime.
              </p>
            </form>
          </div>
        </div>

        {/* Corporate Address & Contact Strip */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-400 text-xs">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Support: {CONTACT_PHONE}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Email: {CONTACT_EMAIL}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">{ADDRESS}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 py-4 px-4 text-center text-[11px] text-slate-500 border-t border-slate-800/60">
        <p>
          © 2026 {SITE_NAME} | Demo Store | Last Updated: 28 Oct 2026 | All prices are demo data
        </p>
      </div>
    </footer>
  );
}
