import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (status !== 'all') {
      where.status = status;
    }

    if (category !== 'all') {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
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

    const formatted = products.map((p) => {
      let images: string[] = [];
      try {
        images = JSON.parse(p.images);
      } catch {
        images = [];
      }

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
        images,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json({ products: formatted, categories });
  } catch (error) {
    console.error('[GET /api/admin/products]', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const {
      name,
      sku,
      categoryId,
      subCategory,
      price,
      originalPrice,
      description,
      stockCount = 10,
      lowStockAlert = 5,
      status = 'published',
      badge,
      featured = false,
      images = [],
      features = [],
      specifications = {},
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Valid price in INR is required' }, { status: 400 });
    }

    const pricePaise = Math.round(price * 100);
    const origPricePaise = originalPrice
      ? Math.round(originalPrice * 100)
      : Math.round(price * 100 * 1.25);
    const discount =
      origPricePaise > pricePaise
        ? Math.round(((origPricePaise - pricePaise) / origPricePaise) * 100)
        : 0;

    // Generate unique slug
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!baseSlug) baseSlug = `product-${Date.now()}`;

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Check SKU uniqueness if provided
    if (sku?.trim()) {
      const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim() } });
      if (existingSku) {
        return NextResponse.json({ error: `SKU "${sku}" is already in use.` }, { status: 400 });
      }
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name: name.trim(),
          slug,
          sku: sku?.trim() || null,
          categoryId,
          subCategory: subCategory?.trim() || null,
          price: pricePaise,
          originalPrice: origPricePaise,
          discount,
          description: description?.trim() || name.trim(),
          status,
          isActive: status === 'published',
          badge: badge?.trim() || null,
          featured: Boolean(featured),
          isDemo: true,
          images: JSON.stringify(images.length > 0 ? images : ['/images/brother-ink-products.jpg']),
          features: JSON.stringify(features),
          specifications: JSON.stringify(specifications),
        },
      });

      await tx.inventory.create({
        data: {
          productId: prod.id,
          stockCount: Math.max(0, Number(stockCount)),
          reserved: 0,
          lowStockAlert: Math.max(1, Number(lowStockAlert)),
        },
      });

      return prod;
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('[POST /api/admin/products]', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

