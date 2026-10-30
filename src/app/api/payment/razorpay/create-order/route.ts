import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getRazorpayClient, getRazorpayPublicKey } from '@/lib/razorpay';
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

interface CreateOrderBody {
  addressId?: string;
  shippingAddress?: ShippingAddressPayload;
  items: ItemPayload[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Please log in or create an account to proceed with payment.' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateOrderBody;
    const { addressId, shippingAddress, items } = body;

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
        return NextResponse.json({ error: 'Please enter street address / house / building.' }, { status: 400 });
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

    // 3. Calculate authoritative price and check/reserve inventory inside transaction
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
          throw new Error(`"${product.name}" is not currently available.`);
        }

        // Validate & reserve stock atomically
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

            // Reserve stock during checkout
            await tx.inventory.update({
              where: { productId: component.id },
              data: {
                stockCount: { decrement: requiredQty },
              },
            });
          }
        } else {
          const currentStock = product.inventory?.stockCount ?? 0;
          const reserved = product.inventory?.reserved ?? 0;
          const available = currentStock - reserved;

          if (available < item.quantity) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${available}, Requested: ${item.quantity}.`
            );
          }

          // Reserve stock during checkout
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
          price: product.price,
          quantity: item.quantity,
        });
      }

      const subtotalRupees = subtotalPaise / 100;
      const shippingRupees =
        subtotalRupees >= FREE_SHIPPING_THRESHOLD || subtotalPaise === 0
          ? 0
          : STANDARD_SHIPPING_FEE;
      const shippingPaise = shippingRupees * 100;
      const taxPaise = Math.round(subtotalPaise * (GST_RATE / (1 + GST_RATE)));
      const grandTotalPaise = subtotalPaise + shippingPaise;

      const datePart = Date.now().toString().slice(-6);
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `BRO-${datePart}-${randPart}`;

      // Create Razorpay Order
      let razorpayOrderId = '';
      const rzp = getRazorpayClient();
      if (rzp && !process.env.RAZORPAY_KEY_ID?.includes('placeholder')) {
        try {
          const rzpOrder = await rzp.orders.create({
            amount: grandTotalPaise,
            currency: 'INR',
            receipt: orderNumber,
            notes: {
              orderNumber,
              userId: session.userId,
            },
          });
          razorpayOrderId = rzpOrder.id;
        } catch (rzpErr) {
          console.error('Razorpay API error', rzpErr);
          throw new Error('Failed to create payment session with Razorpay. Please try again.');
        }
      } else {
        // Safe test mode order ID when keys are in development/test setup
        razorpayOrderId = `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      }

      const orderNotes = JSON.stringify({
        paymentMethod: 'RAZORPAY',
        razorpayOrderId,
        customerName: resolvedAddress?.fullName || 'Customer',
        customerPhone: resolvedAddress?.phone || '',
        landmark: shippingAddress?.landmark || '',
        paymentDate: null,
        refundStatus: null,
      });

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          addressId: finalAddressId,
          status: 'pending',
          paymentStatus: 'pending',
          subtotal: subtotalPaise,
          shipping: shippingPaise,
          tax: taxPaise,
          grandTotal: grandTotalPaise,
          notes: orderNotes,
          items: {
            create: orderItemsToCreate,
          },
        },
      });

      return {
        ...createdOrder,
        razorpayOrderId,
      };
    });

    return NextResponse.json({
      success: true,
      keyId: getRazorpayPublicKey(),
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      razorpayOrderId: newOrder.razorpayOrderId,
      amount: newOrder.grandTotal, // in paise for Razorpay checkout
      currency: 'INR',
      customer: {
        name: resolvedAddress?.fullName || 'Customer',
        email: session.email,
        contact: resolvedAddress?.phone || '',
      },
    });
  } catch (error: unknown) {
    console.error('[POST /api/payment/razorpay/create-order]', error);
    const msg = error instanceof Error ? error.message : 'Failed to create payment order.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
