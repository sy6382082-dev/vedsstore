'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CONTACT_PHONE, CONTACT_EMAIL, ADDRESS } from '@/lib/constants';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in all mandatory fields (Name, Email, Message).');
      return;
    }

    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Enquiry',
        message: '',
      });
    }, 800);
  };

  return (
    <section id="contact-section" className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Get in Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                We&apos;re Here to Help
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Have questions about bulk orders, Brother ink printer compatibility, or custom bracelet sizing? Reach our Mumbai support desk anytime.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Customer Care Hotline
                  </h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {CONTACT_PHONE}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mon - Sat: 9:00 AM - 8:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Official Email Support
                  </h4>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {CONTACT_EMAIL}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Guaranteed response within 4 working hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    HQ &amp; Fulfillment Center
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {ADDRESS}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Send us a Message
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Fill in the form below and an agent will get back to you shortly. (Demo form simulator)
            </p>

            {status === 'success' && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-sm">Thank You! Your message was received.</p>
                  <p className="mt-0.5">
                    Our team will review your enquiry. This is a functional demo acknowledgment.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline"
                  >
                    Send another query
                  </button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-900 dark:text-red-200 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Priya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="priya@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (Optional)
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enquiry Subject
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Printer Ink Compatibility">Printer Ink Compatibility</option>
                    <option value="Jewellery Sizing / Care">Jewellery Sizing / Care</option>
                    <option value="Bulk Order Quotation">Bulk Order Quotation</option>
                    <option value="Returns & Refunds">Returns &amp; Refunds</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Details *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can our customer team assist you today?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                isLoading={status === 'submitting'}
                className="w-full sm:w-auto font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                Submit Enquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
