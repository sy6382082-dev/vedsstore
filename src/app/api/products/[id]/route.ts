import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { products as fallbackProducts } from '@/data/products';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        category: true,
        inventory: true,
        bundleParentItems: {
          include: {
            componentProduct: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (!product) {
      const fallback = fallbackProducts.find((p) => p.id === id || p.slug === id);
      if (fallback) {
        return NextResponse.json({
          product: {
            ...fallback,
            slug: fallback.slug || fallback.id,
          },
        });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let stockCount = (product.inventory?.stockCount ?? 0) - (product.inventory?.reserved ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bundleComponents: any[] | undefined = undefined;

    if (product.isBundle && product.bundleParentItems?.length > 0) {
      bundleComponents = product.bundleParentItems.map((item) => {
        const comp = item.componentProduct;
        const compStock = (comp.inventory?.stockCount ?? 0) - (comp.inventory?.reserved ?? 0);
        let compSpecs: Record<string, string> = {};
        let compImgs: string[] = [];
        try { compSpecs = JSON.parse(comp.specifications); } catch { compSpecs = {}; }
        try { compImgs = JSON.parse(comp.images); } catch { compImgs = []; }

        return {
          id: comp.id,
          slug: comp.slug,
          sku: comp.sku,
          name: comp.name,
          color: compSpecs['Ink Color'] || compSpecs['Color'] || 'Standard',
          stockCount: Math.max(0, compStock),
          inStock: compStock > 0,
          quantity: item.quantity,
          image: compImgs[0] || '/images/brother-ink-products.jpg',
        };
      });

      const compAvailable = bundleComponents.map((c) => Math.floor(c.stockCount / c.quantity));
      stockCount = Math.min(...compAvailable);
    }

    const inStock = stockCount > 0;

    let images: string[] = [];
    let features: string[] = [];
    let specifications: Record<string, string> = {};

    try { images = JSON.parse(product.images as string); } catch { images = []; }
    try { features = JSON.parse(product.features as string); } catch { features = []; }
    try { specifications = JSON.parse(product.specifications as string); } catch { specifications = {}; }

    return NextResponse.json({
      product: {
        ...product,
        slug: product.slug || product.id,
        category: product.category.slug,
        price: product.price / 100,
        originalPrice: product.originalPrice / 100,
        images,
        features,
        specifications,
        stockCount: Math.max(0, stockCount),
        inStock,
        bundleComponents,
      },
    });
  } catch (err) {
    console.error('[GET /api/products/[id]] Error, checking fallback catalog:', err);
    const fallback = fallbackProducts.find((p) => p.id === id || p.slug === id);
    if (fallback) {
      return NextResponse.json({
        product: {
          ...fallback,
          slug: fallback.slug || fallback.id,
        },
      });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

