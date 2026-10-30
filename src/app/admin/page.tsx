import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata = {
  title: 'Admin Console | Brother Store',
  description: 'Manage products, stock alerts, SKU inventory, and catalog status.',
};

export default async function AdminPage() {
  const auth = await requireAdmin();
  if (auth.error) {
    redirect('/admin/login');
  }

  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        inventory: true,
        bundleParentItems: {
          include: {
            componentProduct: {
              select: {
                id: true,
                name: true,
                sku: true,
                inventory: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const initialProducts = rawProducts.map((p) => {
    let images: string[] = [];
    let features: string[] = [];
    let specifications: Record<string, string> = {};

    try { images = JSON.parse(p.images); } catch { images = []; }
    try { features = JSON.parse(p.features); } catch { features = []; }
    try { specifications = JSON.parse(p.specifications); } catch { specifications = {}; }

    let availableStock = (p.inventory?.stockCount ?? 0) - (p.inventory?.reserved ?? 0);
    if (p.isBundle && p.bundleParentItems?.length > 0) {
      const compStocks = p.bundleParentItems.map((bi) => {
        const inv = bi.componentProduct.inventory;
        const avail = (inv?.stockCount ?? 0) - (inv?.reserved ?? 0);
        return Math.floor(Math.max(0, avail) / (bi.quantity || 1));
      });
      availableStock = Math.min(...compStocks);
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      status: p.status,
      isActive: p.isActive,
      isBundle: p.isBundle,
      price: p.price / 100, // Rupee
      originalPrice: p.originalPrice / 100,
      discount: p.discount,
      category: p.category,
      subCategory: p.subCategory,
      stockCount: p.inventory?.stockCount ?? 0,
      availableStock,
      reserved: p.inventory?.reserved ?? 0,
      lowStockAlert: p.inventory?.lowStockAlert ?? 5,
      badge: p.badge,
      featured: p.featured,
      description: p.description,
      images,
      features,
      specifications,
      updatedAt: p.updatedAt.toISOString(),
    };
  });

  return (
    <AdminDashboardClient
      adminUser={auth.user}
      initialProducts={initialProducts}
      categories={categories}
    />
  );
}
