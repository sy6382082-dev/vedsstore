'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-12 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-blue-500/10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Unlock 10% Off Your Next Purchase
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Join 25,000+ Indian shoppers who receive our weekly curated edits of genuine inks, fashion accessories, and flash sale vouchers.
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 max-w-md mx-auto flex items-center justify-center gap-2 text-emerald-200 text-xs sm:text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Success! Check your inbox for your welcome coupon code.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Button
              type="submit"
              variant="gold"
              className="w-full sm:w-auto shrink-0 font-bold text-xs py-3 px-6"
            >
              Subscribe
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>
        )}

        <p className="text-[11px] text-slate-400">
          We respect your privacy. No spam ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
