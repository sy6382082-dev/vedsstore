import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { products as fallbackProducts } from '@/data/products';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort') ?? 'createdAt';
  const order = searchParams.get('order') ?? 'desc';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');

  try {
    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      isActive: true,
      status: 'published',
    };

    if (category) {
      const cleanSlug = category.toLowerCase().trim();
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: cleanSlug },
            { id: category },
            { name: { equals: cleanSlug } },
          ],
        },
      });

      if (cat) {
        where.categoryId = cat.id;
      } else {
        // Fallback to static catalog if category not yet in DB
        let filtered = fallbackProducts.filter(
          (p) => p.category?.toLowerCase() === cleanSlug
        );
        if (minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
        if (maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
        if (inStock === 'true') filtered = filtered.filter((p) => p.inStock);
        return NextResponse.json({ products: filtered });
      }
    }

    if (featured === 'true') where.featured = true;

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
        { subCategory: { contains: q } },
      ];
    }

    if (minPrice) {
      where.price = { ...(where.price ?? {}), gte: Math.round(parseFloat(minPrice) * 100) };
    }
    if (maxPrice) {
      where.price = { ...(where.price ?? {}), lte: Math.round(parseFloat(maxPrice) * 100) };
    }

    const allowedSorts = ['price', 'rating', 'createdAt', 'name', 'reviewCount', 'discount'];
    const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';
    const sortOrder: 'asc' | 'desc' = order === 'asc' ? 'asc' : 'desc';

    const raw = await prisma.product.findMany({
      where,
      include: {
        category: { select: { slug: true, name: true } },
        inventory: { select: { stockCount: true, reserved: true } },
        bundleParentItems: {
          include: {
            componentProduct: {
              select: {
                id: true,
                name: true,
                sku: true,
                inventory: { select: { stockCount: true, reserved: true } },
              },
            },
          },
        },
      },
      orderBy: { [sortField]: sortOrder },
    });

    let products = raw.map((p) => {
      let available = (p.inventory?.stockCount ?? 0) - (p.inventory?.reserved ?? 0);

      // Virtual dynamic stock calculation for bundles based on component inventory
      if (p.isBundle && p.bundleParentItems?.length > 0) {
        const compStocks = p.bundleParentItems.map((bi) => {
          const compInv = bi.componentProduct.inventory;
          const compAvail = (compInv?.stockCount ?? 0) - (compInv?.reserved ?? 0);
          return Math.floor(Math.max(0, compAvail) / (bi.quantity || 1));
        });
        available = Math.min(...compStocks);
      }

      return {
        ...p,
        slug: p.slug || p.id,
        category: p.category.slug,
        price: p.price / 100,
        originalPrice: p.originalPrice / 100,
        images: JSON.parse(p.images) as string[],
        features: JSON.parse(p.features) as string[],
        specifications: JSON.parse(p.specifications) as Record<string, string>,
        stockCount: Math.max(0, available),
        inStock: available > 0,
      };
    });

    if (inStock === 'true') products = products.filter((p) => p.inStock);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('[GET /api/products] Falling back to static catalog:', error);
    let filtered = [...fallbackProducts];
    if (category) {
      const cleanSlug = category.toLowerCase().trim();
      filtered = filtered.filter((p) => p.category?.toLowerCase() === cleanSlug);
    }
    if (featured === 'true') {
      filtered = filtered.filter((p) => p.featured);
    }
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    }
    if (inStock === 'true') {
      filtered = filtered.filter((p) => p.inStock);
    }
    return NextResponse.json({ products: filtered });
  }
}

