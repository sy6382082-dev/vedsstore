import React from 'react';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { TrendingItems } from '@/components/home/TrendingItems';
import { PromoSection } from '@/components/home/PromoSection';
import { FAQSection } from '@/components/home/FAQSection';
import { ContactForm } from '@/components/forms/ContactForm';
import { NewsletterForm } from '@/components/forms/NewsletterForm';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Category Cards */}
      <CategoryCards />

      {/* 3. Featured Products */}
      <FeaturedProducts />

      {/* 4. Trending Items */}
      <TrendingItems />

      {/* 5. Promotional Section */}
      <PromoSection />

      {/* 6. FAQ Section */}
      <FAQSection />

      {/* 7. Contact Form */}
      <ContactForm />

      {/* 8. Newsletter Form */}
      <NewsletterForm />
    </div>
  );
}
