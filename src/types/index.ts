export type Category = 'bracelets' | 'hand-accessories' | 'printer-ink';

export interface BundleComponentItem {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  color: string;
  stockCount: number;
  inStock: boolean;
  quantity: number;
  image: string;
}

export interface Product {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  category: Category;
  subCategory?: string;
  price: number;          // INR
  originalPrice: number;  // INR (MRP)
  discount: number;       // percentage
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;    // for low-stock label
  images: string[];       // placeholder URLs
  description: string;
  features: string[];
  specifications: Record<string, string>;
  badge?: string;         // 'Best Seller' | 'New' | 'Sale' | 'Trending'
  featured?: boolean;
  isBundle?: boolean;
  bundleComponents?: BundleComponentItem[];
  isDemo?: boolean;       // always true for demo data
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  image: string;
  productCount: number;
  icon: string;
  featured: boolean;
}
