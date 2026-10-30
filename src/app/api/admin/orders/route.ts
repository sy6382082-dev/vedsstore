import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('date') || 'all';

    // Build date filter
    let dateFilter: { gte?: Date } | undefined = undefined;
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfDay };
    } else if (dateRange === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: sevenDaysAgo };
    } else if (dateRange === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: thirtyDaysAgo };
    }

    // Build Prisma where clause
    const where: {
      status?: string;
      createdAt?: { gte?: Date };
      OR?: Array<Record<string, unknown>>;
    } = {};

    if (status !== 'all') {
      where.status = status;
    }

    if (dateFilter) {
      where.createdAt = dateFilter;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { profile: { firstName: { contains: search } } } },
        { user: { profile: { lastName: { contains: search } } } },
        { shippingAddress: { fullName: { contains: search } } },
        { shippingAddress: { phone: { contains: search } } },
        { shippingAddress: { city: { contains: search } } },
      ];
    }

    const [orders, allOrdersForMetrics] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          shippingAddress: true,
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  sku: true,
                  images: true,
                  isBundle: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        select: {
          id: true,
          status: true,
          grandTotal: true,
        },
      }),
    ]);

    // Calculate metrics
    const totalOrders = allOrdersForMetrics.length;
    const pendingOrders = allOrdersForMetrics.filter((o) => o.status === 'pending').length;
    const confirmedOrders = allOrdersForMetrics.filter((o) => o.status === 'confirmed').length;
    const deliveredOrders = allOrdersForMetrics.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = allOrdersForMetrics.filter((o) => o.status === 'cancelled').length;
    const totalRevenue =
      allOrdersForMetrics
        .filter((o) => o.status !== 'cancelled')
        .reduce((acc, o) => acc + o.grandTotal, 0) / 100;

    const formattedOrders = orders.map((order) => {
      let notesObj: Record<string, unknown> = {};
      try {
        if (order.notes) notesObj = JSON.parse(order.notes);
      } catch {
        notesObj = {};
      }

      const customerName =
        order.shippingAddress?.fullName ||
        [order.user.profile?.firstName, order.user.profile?.lastName].filter(Boolean).join(' ') ||
        order.user.email.split('@')[0];

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal / 100,
        shipping: order.shipping / 100,
        tax: order.tax / 100,
        grandTotal: order.grandTotal / 100,
        customerName,
        customerEmail: order.user.email,
        customerPhone: order.shippingAddress?.phone || (notesObj.customerPhone as string) || 'N/A',
        notes: notesObj,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippingAddress: order.shippingAddress,
        items: order.items.map((i) => {
          let imgs: string[] = [];
          try {
            imgs = JSON.parse(i.product.images);
          } catch {
            imgs = ['/images/brother-ink-products.jpg'];
          }
          return {
            id: i.id,
            productId: i.productId,
            productName: i.productName,
            sku: i.product.sku,
            slug: i.product.slug,
            isBundle: i.product.isBundle,
            image: imgs[0] || '/images/brother-ink-products.jpg',
            price: i.price / 100,
            quantity: i.quantity,
            itemTotal: (i.price / 100) * i.quantity,
          };
        }),
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      metrics: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/orders]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

