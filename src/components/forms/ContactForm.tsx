'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
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
    }, 600);
  };

  return (
    <section id="contact-section" className="py-12 sm:py-16 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
                Get in Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] mt-1">
                We&apos;re Here to Help
              </h2>
              <p className="text-xs sm:text-sm text-[#737373] mt-2 leading-relaxed">
                Have questions about orders, product compatibility, or sizing? Reach our customer support team anytime.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-lg bg-white border border-[#e5e5e5]">
                <div className="p-2 rounded bg-[#f5f5f5] text-[#171717] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Customer Support
                  </h4>
                  <p className="text-sm font-medium text-[#171717] mt-0.5">
                    {CONTACT_PHONE}
                  </p>
                  <p className="text-[11px] text-[#737373]">
                    Mon - Sat: 9:00 AM - 8:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-lg bg-white border border-[#e5e5e5]">
                <div className="p-2 rounded bg-[#f5f5f5] text-[#171717] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Email Support
                  </h4>
                  <p className="text-sm font-medium text-[#171717] mt-0.5">
                    {CONTACT_EMAIL}
                  </p>
                  <p className="text-[11px] text-[#737373]">
                    Support responses within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-lg bg-white border border-[#e5e5e5]">
                <div className="p-2 rounded bg-[#f5f5f5] text-[#171717] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Commerce Office
                  </h4>
                  <p className="text-xs text-[#737373] mt-0.5 leading-relaxed">
                    {ADDRESS}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-[#fafafa] p-6 sm:p-8 rounded-lg border border-[#e5e5e5]">
            <h3 className="text-lg font-bold text-[#171717] mb-1">
              Send us a Message
            </h3>
            <p className="text-xs text-[#737373] mb-6">
              Complete the form below and our team will get back to you shortly.
            </p>

            {status === 'success' && (
              <div className="mb-6 p-4 rounded-md bg-[#f5f5f5] border border-[#e5e5e5] flex items-start gap-3 text-[#171717]">
                <CheckCircle2 className="w-4 h-4 text-[#171717] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-sm">Thank you! Your message was received.</p>
                  <p className="mt-0.5 text-[#737373]">
                    Our support team will follow up on your request.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-3 rounded-md bg-[#f5f5f5] border border-[#e5e5e5] flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-[#171717] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-[#171717] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-[#171717] mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-medium text-[#171717] mb-1">
                    Enquiry Topic
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#171717] focus:border-[#171717] outline-none transition-colors"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Order Status">Order Status &amp; Tracking</option>
                    <option value="Product Authenticity">Product Authenticity</option>
                    <option value="Bulk Order">Bulk / Wholesale Request</option>
                    <option value="Returns">Returns &amp; Replacement</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-medium text-[#171717] mb-1">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2 text-xs rounded-md bg-white border border-[#e5e5e5] text-[#171717] placeholder:text-[#737373] focus:border-[#171717] outline-none transition-colors resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={status === 'submitting'}
                className="w-full sm:w-auto"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
