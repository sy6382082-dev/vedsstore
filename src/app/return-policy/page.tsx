import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  RotateCcw,
  Calendar,
  PackageCheck,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  SITE_NAME,
  CONTACT_PHONE,
  CONTACT_EMAIL,
  CONTACT_HOURS,
  ADDRESS,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: `Return & Refund Policy | ${SITE_NAME}`,
  description:
    'Read the official 7-day return and refund policy for VED-HUB. Clear guidelines on returns, replacements, inspection, and refund processing timelines.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white min-h-screen text-[#171717] py-8 sm:py-12 border-b border-[#e5e5e5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#737373]">
          <Link href="/" className="hover:text-[#171717] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#171717] font-medium">Return &amp; Refund Policy</span>
        </nav>

        {/* Page Header */}
        <div className="space-y-3 pb-6 border-b border-[#e5e5e5]">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#f5f5f5] border border-[#e5e5e5] text-xs font-medium text-[#737373]">
            <RotateCcw className="w-3.5 h-3.5 text-[#171717]" />
            <span>7-Day Return Guarantee</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            Return &amp; Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-2xl">
            At {SITE_NAME}, we want you to shop with complete confidence. Below is our transparent 7-day return, replacement, and refund policy applicable to all orders delivered in India.
          </p>
          <div className="text-[11px] text-[#737373] pt-1">
            Effective Date: October 2026 • Applicable domain: <span className="font-mono text-[#171717]">ved-hub.in</span>
          </div>
        </div>

        {/* 4 Summary Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
            <div className="flex items-center gap-2 text-[#171717]">
              <Calendar className="w-4 h-4" />
              <h3 className="font-semibold text-xs uppercase tracking-wider">7-Day Window</h3>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Counted strictly from the actual delivery date recorded by the courier partner.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
            <div className="flex items-center gap-2 text-[#171717]">
              <PackageCheck className="w-4 h-4" />
              <h3 className="font-semibold text-xs uppercase tracking-wider">Original Condition</h3>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Items must be unused, undamaged, with intact packaging, seals, and original invoice.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
            <div className="flex items-center gap-2 text-[#171717]">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="font-semibold text-xs uppercase tracking-wider">Quality Inspection</h3>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Refunds are issued after the returned package is received and verified at our warehouse.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
            <div className="flex items-center gap-2 text-[#171717]">
              <CreditCard className="w-4 h-4" />
              <h3 className="font-semibold text-xs uppercase tracking-wider">5–7 Day Refunds</h3>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Processed back to the original payment source via Razorpay / direct bank transfer.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs sm:text-sm text-[#737373] leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">1</span>
              7-Day Return Eligibility Period
            </h2>
            <p>
              Customers may request a return or exchange for any eligible product within <strong>7 calendar days</strong> of receiving their shipment.
            </p>
            <div className="p-3.5 rounded-md bg-[#fafafa] border border-[#e5e5e5] text-xs space-y-1.5 text-[#171717]">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#171717]" />
                Important: Starts from Actual Delivery Date
              </p>
              <p className="text-[#737373]">
                The 7-day period begins on the day our courier partner updates your order tracking status to <strong>&ldquo;Delivered&rdquo;</strong>, not the date the order was placed or dispatched. Return requests received after the 7-day window expires cannot be accepted.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">2</span>
              Product Condition &amp; Packaging Requirements
            </h2>
            <p>
              To qualify for a refund or replacement, returned products must meet all the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Unused &amp; Undamaged:</strong> The item must show no signs of usage, scratches, wear, or physical alteration.
              </li>
              <li>
                <strong>Original Packaging:</strong> Products must be inside their original manufacturer packaging, including outer boxes, internal trays, and protective sleeves.
              </li>
              <li>
                <strong>Accessories &amp; Tags:</strong> All tags, labels, barcodes, user manuals, warranty cards, and bundled accessories must be present and untampered.
              </li>
              <li>
                <strong>Invoice:</strong> A copy of the original physical tax invoice or packaging slip must accompany the return parcel.
              </li>
            </ul>

            <div className="pt-2">
              <h3 className="font-semibold text-xs text-[#171717] uppercase tracking-wider mb-2">
                Category-Specific Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded border border-[#e5e5e5] bg-white space-y-1">
                  <span className="font-semibold text-[#171717] block">Printer Supplies &amp; Ink Bottles</span>
                  <p className="text-[#737373]">
                    OEM ink bottles and cartridges must remain 100% factory sealed with original holographic tamper-evident seals intact. Unsealed, opened, or used ink bottles cannot be returned due to transit leakage and chemical contamination hazards.
                  </p>
                </div>
                <div className="p-3 rounded border border-[#e5e5e5] bg-white space-y-1">
                  <span className="font-semibold text-[#171717] block">Jewellery &amp; Accessories</span>
                  <p className="text-[#737373]">
                    Bracelets and hand accessories must be unworn, free of perfume/water exposure, and returned in their original packaging pouch with authenticity tags attached.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">3</span>
              Damaged, Defective, or Incorrect Deliveries
            </h2>
            <p>
              We stand firmly behind the authenticity and quality of every product we deliver. In the rare event that an item arrives:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Physically damaged or leaking during shipment</li>
              <li>Defective or non-functional upon initial unboxing</li>
              <li>Incorrect product, model, color, or variant delivered</li>
            </ul>
            <p>
              Please notify our customer care team within the <strong>7-day window</strong> (ideally within 48 hours of delivery) with photos or an unboxing video showing the shipping label, packaging, and defect.
            </p>
            <p>
              Once verified by our support staff, we will schedule a free reverse pickup and offer you your choice of an <strong>immediate replacement dispatch</strong> or a <strong>100% refund</strong>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">4</span>
              Inspection Before Refund Approval
            </h2>
            <p>
              Refunds are <strong>not automatically approved</strong> upon submitting a return request. 
            </p>
            <p>
              All returned parcels are transported by our logistics partners to our verification warehouse. Our quality assurance team inspects the item within <strong>24 to 48 hours of arrival</strong> to verify that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The serial number, batch code, or SKU matches the original dispatch record.</li>
              <li>All original contents, accessories, and documentation are included.</li>
              <li>There is no unauthorized disassembly, damage, or seal tampering.</li>
            </ul>
            <p>
              Upon successful physical inspection approval, your refund is instantly initiated in our payment gateway. If an item fails inspection (e.g. damaged through customer misuse, missing parts, or unsealed consumable), it will be returned to the customer and no refund will be issued.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">5</span>
              Refund Method &amp; Processing Timelines
            </h2>
            <p>
              Approved refunds are credited in accordance with the official settlement timelines of our payment partner, <strong>Razorpay</strong>, and standard Indian banking operations:
            </p>

            <div className="overflow-x-auto border border-[#e5e5e5] rounded-lg mt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e5e5e5] text-[#171717]">
                  <tr>
                    <th className="p-3 font-semibold">Original Payment Mode</th>
                    <th className="p-3 font-semibold">Refund Destination</th>
                    <th className="p-3 font-semibold">Estimated Reflection Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  <tr>
                    <td className="p-3 font-medium text-[#171717]">UPI (Google Pay, PhonePe, Paytm, etc.)</td>
                    <td className="p-3">Original linked bank account via UPI</td>
                    <td className="p-3 font-medium text-[#171717]">3 to 5 business days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[#171717]">Credit / Debit Card (Visa, Mastercard, RuPay)</td>
                    <td className="p-3">Original card account statement</td>
                    <td className="p-3 font-medium text-[#171717]">5 to 7 business days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[#171717]">Net Banking</td>
                    <td className="p-3">Original originating bank account</td>
                    <td className="p-3 font-medium text-[#171717]">5 to 7 business days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-[#171717]">Cash on Delivery (COD)</td>
                    <td className="p-3">Direct NEFT / IMPS / UPI transfer</td>
                    <td className="p-3 font-medium text-[#171717]">3 to 5 business days (after verifying bank details)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-[#737373] pt-1">
              <em>Note:</em> Public holidays, bank strikes, and weekend settlement cutoffs may occasionally cause minor settlement delays beyond our control.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">6</span>
              How to Request a Return (Step-by-Step)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] space-y-2">
                <span className="font-mono text-xs font-bold text-[#171717] block">STEP 01</span>
                <h4 className="font-semibold text-xs text-[#171717]">Contact Customer Support</h4>
                <p className="text-[11px] text-[#737373] leading-relaxed">
                  Email <strong>{CONTACT_EMAIL}</strong> or call <strong>{CONTACT_PHONE}</strong> with your Order ID (e.g. #ORD-...) and clear pictures of the item and original packaging.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] space-y-2">
                <span className="font-mono text-xs font-bold text-[#171717] block">STEP 02</span>
                <h4 className="font-semibold text-xs text-[#171717]">Doorstep Reverse Pickup</h4>
                <p className="text-[11px] text-[#737373] leading-relaxed">
                  Upon approval, our courier will pick up the package from your delivery address within 2–3 business days. Hand over the securely packed item and invoice.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] space-y-2">
                <span className="font-mono text-xs font-bold text-[#171717] block">STEP 03</span>
                <h4 className="font-semibold text-xs text-[#171717]">Inspection &amp; Refund</h4>
                <p className="text-[11px] text-[#737373] leading-relaxed">
                  After passing quality verification at our facility, the refund is initiated to your original payment method, and you receive an email confirmation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 pb-6 border-b border-[#e5e5e5]">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">7</span>
              Order Cancellations
            </h2>
            <p>
              You can cancel your order free of charge at any time before it enters the <strong>&ldquo;Shipped&rdquo;</strong> status by visiting your{' '}
              <Link href="/account/orders" className="text-[#171717] underline font-medium">
                Account Orders
              </Link>{' '}
              page. Once an order is shipped, cancellation is not possible; you may instead request a return within 7 days of delivery under this policy.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#171717] flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#171717] text-white text-xs flex items-center justify-center font-mono">8</span>
              Contact Support for Returns &amp; Assistance
            </h2>
            <p>
              For any questions regarding returns, exchanges, or refund tracking, our dedicated support team is at your service:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
                <div className="flex items-center gap-2 text-[#171717]">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold text-xs uppercase tracking-wider">Email Support</span>
                </div>
                <p className="text-xs text-[#171717] font-medium">{CONTACT_EMAIL}</p>
                <p className="text-[11px] text-[#737373]">
                  Include your Order ID in the email subject for fastest resolution.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#fafafa] border border-[#e5e5e5] space-y-2">
                <div className="flex items-center gap-2 text-[#171717]">
                  <Phone className="w-4 h-4" />
                  <span className="font-semibold text-xs uppercase tracking-wider">Telephone Support</span>
                </div>
                <p className="text-xs text-[#171717] font-medium">{CONTACT_PHONE}</p>
                <p className="text-[11px] text-[#737373] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {CONTACT_HOURS}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white border border-[#e5e5e5] text-xs text-[#737373] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#171717] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#171717] block mb-0.5">Physical Registered Office</span>
                <p>{ADDRESS}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Shopping CTA */}
        <div className="pt-6 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#171717] text-white hover:bg-black text-xs font-medium text-center transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/#contact-section"
            className="w-full sm:w-auto px-5 py-2.5 rounded border border-[#e5e5e5] text-[#171717] hover:bg-[#fafafa] text-xs font-medium text-center transition-colors"
          >
            Submit Support Request
          </Link>
        </div>
      </div>
    </div>
  );
}

