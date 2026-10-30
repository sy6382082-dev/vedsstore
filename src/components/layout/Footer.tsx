'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
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
    showToast('Subscribed to VED-HUB updates.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-white text-[#737373] border-t border-[#e5e5e5] text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand info */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <span className="font-bold text-xl tracking-tight text-[#171717]">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-xs text-[#737373] leading-relaxed max-w-sm">
              Everything you need, simply. Curated everyday essentials, authentic printer supplies, and quality accessories delivered reliably.
            </p>
            <div className="pt-2 text-xs text-[#171717] space-y-1">
              <p className="font-medium">ved-hub.in</p>
            </div>
          </div>

          {/* Shop links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#171717] uppercase text-[11px] tracking-wider">
              Shop Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/bracelets" className="hover:text-[#171717] transition-colors">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link href="/category/hand-accessories" className="hover:text-[#171717] transition-colors">
                  Hand Accessories
                </Link>
              </li>
              <li>
                <Link href="/category/printer-ink" className="hover:text-[#171717] transition-colors">
                  Printer Ink &amp; Cartridges
                </Link>
              </li>
              <li>
                <Link href="/search?q=" className="hover:text-[#171717] transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#171717] uppercase text-[11px] tracking-wider">
              Help &amp; Policies
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#faq-section" className="hover:text-[#171717] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-[#171717] transition-colors">
                  Shipping &amp; Delivery
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-[#171717] transition-colors">
                  Returns &amp; Replacements
                </a>
              </li>
              <li>
                <a href="#contact-section" className="hover:text-[#171717] transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-[#171717] transition-colors">
                  Privacy Policy &amp; Terms
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#171717] uppercase text-[11px] tracking-wider">
              Stay Updated
            </h4>
            <p className="text-xs text-[#737373]">
              Subscribe for new arrivals, catalog updates, and order notifications.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 rounded-md bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#171717] placeholder:text-[#737373] outline-none focus:border-[#171717] focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-3 py-2 rounded-md bg-[#171717] text-white hover:bg-black text-xs font-medium transition-colors shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Contact details row */}
        <div className="mt-10 pt-6 border-t border-[#e5e5e5] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#737373]">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#171717] shrink-0" />
            <span>Support: {CONTACT_PHONE}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#171717] shrink-0" />
            <span>Email: {CONTACT_EMAIL}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#171717] shrink-0" />
            <span className="truncate">{ADDRESS}</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-4 px-4 text-center text-[11px] text-[#737373] border-t border-[#e5e5e5]">
        <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
