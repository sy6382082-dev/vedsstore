import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { validateServerCart } from '@/lib/inventory';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Please log in or create an account to continue with your order.',
          requireAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const items = body.items as { productId: string; quantity: number }[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    const validation = await validateServerCart(items);

    return NextResponse.json({
      success: true,
      user: { userId: session.userId, email: session.email },
      validation,
      demoNotice:
        'Phase 3 Validation Complete: Authoritative server price and inventory checks succeeded. Live payments and order placement scheduled for Phase 4.',
    });
  } catch (error) {
    console.error('[POST /api/checkout/validate]', error);
    return NextResponse.json({ error: 'Cart validation failed' }, { status: 500 });
  }
}

