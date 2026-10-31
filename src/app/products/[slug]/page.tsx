'use client';

import { use } from 'react';
import ProductDetailPage from '@/app/product/[id]/page';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductsSlugPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  // Delegate to ProductDetailPage which looks up by either id or slug
  return <ProductDetailPage params={Promise.resolve({ id: unwrappedParams.slug })} />;
}

