import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE, GST_RATE } from '@/lib/constants';

interface ItemPayload {
  productId: string;
  quantity: number;
}

interface ShippingAddressPayload {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface PlaceOrderPayload {
  addressId?: string;
  shippingAddress?: ShippingAddressPayload;
  paymentMethod: 'COD' | 'RAZORPAY_TEST';
  notes?: string;
  items: ItemPayload[];
  idempotencyKey?: string;
}

// In-memory idempotency cache for duplicate submission prevention (15s window)
const recentOrdersCache = new Map<string, { orderId: string; orderNumber: string; timestamp: number }>();

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Please log in or create an account to place an order.' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as PlaceOrderPayload;
    const { addressId, shippingAddress, paymentMethod, items, idempotencyKey } = body;

    // Check idempotency key if provided
    if (idempotencyKey && recentOrdersCache.has(idempotencyKey)) {
      const cached = recentOrdersCache.get(idempotencyKey)!;
      if (Date.now() - cached.timestamp < 30_000) {
        return NextResponse.json({
          success: true,
          duplicatePrevented: true,
          order: { id: cached.orderId, orderNumber: cached.orderNumber },
        });
      }
    }

    // 1. Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json({ error: 'Invalid item in cart payload.' }, { status: 400 });
      }
    }

    // 2. Validate or create shipping address
    let finalAddressId: string | null = null;
    let resolvedAddress = null;

    if (addressId) {
      resolvedAddress = await prisma.address.findFirst({
        where: { id: addressId, userId: session.userId },
      });
      if (!resolvedAddress) {
        return NextResponse.json({ error: 'Selected address not found.' }, { status: 400 });
      }
      finalAddressId = resolvedAddress.id;
    } else if (shippingAddress) {
      const { fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark } =
        shippingAddress;

      if (!fullName || fullName.trim().length < 2) {
        return NextResponse.json({ error: 'Please enter a valid customer name.' }, { status: 400 });
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return NextResponse.json(
          { error: 'Please enter a valid 10-digit mobile number.' },
          { status: 400 }
        );
      }

      if (!addressLine1 || addressLine1.trim().length < 4) {
        return NextResponse.json({ error: 'Please enter a complete street address.' }, { status: 400 });
      }

      if (!city || city.trim().length === 0) {
        return NextResponse.json({ error: 'City is required.' }, { status: 400 });
      }

      if (!state || state.trim().length === 0) {
        return NextResponse.json({ error: 'State is required.' }, { status: 400 });
      }

      if (!/^\d{6}$/.test(pincode.trim())) {
        return NextResponse.json({ error: 'Please enter a valid 6-digit PIN code.' }, { status: 400 });
      }

      const formattedLine2 = [addressLine2?.trim(), landmark?.trim() ? `Near: ${landmark.trim()}` : '']
        .filter(Boolean)
        .join(', ');

      const count = await prisma.address.count({ where: { userId: session.userId } });

      resolvedAddress = await prisma.address.create({
        data: {
          userId: session.userId,
          label: 'Delivery',
          fullName: fullName.trim(),
          phone: cleanPhone,
          addressLine1: addressLine1.trim(),
          addressLine2: formattedLine2 || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: 'India',
          isDefault: count === 0,
        },
      });
      finalAddressId = resolvedAddress.id;
    } else {
      return NextResponse.json(
        { error: 'Delivery address details are required.' },
        { status: 400 }
      );
    }

    // 3. Atomically validate prices, verify stock, and deduct inventory inside Prisma Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      let subtotalPaise = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        productName: string;
        price: number;
        quantity: number;
      }> = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: {
            OR: [{ id: item.productId }, { slug: item.productId }],
          },
          include: {
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
          throw new Error(`Product "${item.productId}" no longer exists in catalogue.`);
        }

        if (!product.isActive || product.status !== 'published') {
          throw new Error(`"${product.name}" is not currently available for purchase.`);
        }

        // Handle bundle inventory deduction atomically
        if (product.isBundle) {
          if (!product.bundleParentItems || product.bundleParentItems.length === 0) {
            throw new Error(`Bundle "${product.name}" has no registered components.`);
          }

          for (const bundleItem of product.bundleParentItems) {
            const component = bundleItem.componentProduct;
            const requiredQty = item.quantity * bundleItem.quantity;
            const currentStock = component.inventory?.stockCount ?? 0;
            const reserved = component.inventory?.reserved ?? 0;
            const available = currentStock - reserved;

            if (available < requiredQty) {
              throw new Error(
                `Insufficient stock for bundle component "${component.name}". Available: ${available}, Required: ${requiredQty}.`
              );
            }

            // Deduct component inventory
            await tx.inventory.update({
              where: { productId: component.id },
              data: {
                stockCount: { decrement: requiredQty },
              },
            });
          }
        } else {
          // Regular product inventory deduction
          const currentStock = product.inventory?.stockCount ?? 0;
          const reserved = product.inventory?.reserved ?? 0;
          const available = currentStock - reserved;

          if (available < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${available}, Requested: ${item.quantity}.`
            );
          }

          // Deduct stock count
          await tx.inventory.update({
            where: { productId: product.id },
            data: {
              stockCount: { decrement: item.quantity },
            },
          });
        }

        const itemTotalPaise = product.price * item.quantity;
        subtotalPaise += itemTotalPaise;

        orderItemsToCreate.push({
          productId: product.id,
          productName: product.name,
          price: product.price, // paise snapshot
          quantity: item.quantity,
        });
      }

      // Calculate totals
      const subtotalRupees = subtotalPaise / 100;
      const shippingRupees =
        subtotalRupees >= FREE_SHIPPING_THRESHOLD || subtotalPaise === 0
          ? 0
          : STANDARD_SHIPPING_FEE;
      const shippingPaise = shippingRupees * 100;
      const taxPaise = Math.round(subtotalPaise * (GST_RATE / (1 + GST_RATE)));
      const grandTotalPaise = subtotalPaise + shippingPaise;

      // Generate unique order number (e.g. BRO-739201-4821)
      const datePart = Date.now().toString().slice(-6);
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `BRO-${datePart}-${randPart}`;

      // Notes JSON with structured delivery details & courier stub
      const orderNotes = JSON.stringify({
        paymentMethod: paymentMethod === 'RAZORPAY_TEST' ? 'RAZORPAY_TEST' : 'COD',
        customerName: resolvedAddress?.fullName || 'Customer',
        customerPhone: resolvedAddress?.phone || '',
        landmark: shippingAddress?.landmark || '',
        courierPartner: null,
        trackingNumber: null,
        estimatedDeliveryDays: 3,
        testMode: paymentMethod === 'RAZORPAY_TEST',
      });

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          addressId: finalAddressId,
          status: 'pending',
          paymentStatus: 'pending', // Unpaid until cash collected or verified gateway confirmation
          subtotal: subtotalPaise,
          shipping: shippingPaise,
          tax: taxPaise,
          grandTotal: grandTotalPaise,
          notes: orderNotes,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      });

      // Clear server cart items for user
      const userCart = await tx.cart.findUnique({ where: { userId: session.userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      return createdOrder;
    });

    // Store in idempotency cache
    if (idempotencyKey) {
      recentOrdersCache.set(idempotencyKey, {
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
        subtotal: newOrder.subtotal / 100,
        shipping: newOrder.shipping / 100,
        tax: newOrder.tax / 100,
        grandTotal: newOrder.grandTotal / 100,
        createdAt: newOrder.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('[POST /api/checkout/place-order]', error);
    const message = error instanceof Error ? error.message : 'Failed to place order.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

