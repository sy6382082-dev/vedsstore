import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    if (address.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted address was default, make the most recent one default
    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: session.userId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/account/addresses/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Set this as default
    await prisma.address.updateMany({
      where: { userId: session.userId },
      data: { isDefault: false },
    });
    await prisma.address.update({ where: { id }, data: { isDefault: true } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/account/addresses/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
