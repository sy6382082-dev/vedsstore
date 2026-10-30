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
    <section className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="w-10 h-10 rounded-md bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] mx-auto flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
          Subscribe to VED-HUB Updates
        </h2>
        <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
          Get notified about new stock, essential releases, and catalog additions. Straight to your inbox, no spam.
        </p>

        {submitted ? (
          <div className="p-4 rounded-md bg-[#f5f5f5] border border-[#e5e5e5] max-w-md mx-auto flex items-center justify-center gap-2 text-[#171717] text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#171717]" />
            <span>Thank you for subscribing to VED-HUB updates.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3.5 py-2.5 rounded-md bg-[#f5f5f5] border border-[#e5e5e5] text-xs text-[#171717] placeholder:text-[#737373] focus:border-[#171717] focus:bg-white outline-none transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto shrink-0 text-xs py-2.5 px-5 font-medium"
            >
              <span>Subscribe</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>
        )}

        <p className="text-[11px] text-[#737373]">
          You can unsubscribe anytime with one click.
        </p>
      </div>
    </section>
  );
}
