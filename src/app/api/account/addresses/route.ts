import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error('[GET /api/account/addresses]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as {
      label?: string;
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault?: boolean;
    };

    const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: 'Invalid pincode (6 digits required)' }, { status: 400 });
    }

    // If this is the default, unset existing defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    // Auto-default if first address
    const count = await prisma.address.count({ where: { userId: session.userId } });
    const shouldBeDefault = isDefault || count === 0;

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        label: label ?? 'Home',
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 ?? null,
        city,
        state,
        pincode,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/account/addresses]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

