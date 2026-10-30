import { CategoryInfo } from '@/types';

export const categories: CategoryInfo[] = [
  {
    slug: 'bracelets',
    name: 'Bracelets',
    description: 'Handcrafted & premium bracelets',
    image: 'https://placehold.co/800x400/1e3a5f/white?text=Bracelets+Collection',
    productCount: 8,
    icon: '💎',
    featured: true,
  },
  {
    slug: 'hand-accessories',
    name: 'Hand Accessories',
    description: 'Rings, gloves, nail art & more',
    image: 'https://placehold.co/800x400/0f172a/white?text=Hand+Accessories',
    productCount: 7,
    icon: '💅',
    featured: true,
  },
  {
    slug: 'printer-ink',
    name: 'Printer Ink & Cartridges',
    description: 'OEM & compatible ink bottles',
    image: 'https://placehold.co/800x400/1e40af/white?text=Printer+Ink+%26+Cartridges',
    productCount: 9,
    icon: '🖨️',
    featured: true,
  },
];
