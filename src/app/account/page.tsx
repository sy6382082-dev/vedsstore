import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AccountDashboard from './AccountDashboard';

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login?redirect=/account');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: { take: 1 } },
      },
      addresses: { where: { isDefault: true }, take: 1 },
      wishlist: { include: { _count: { select: { items: true } } } },
    },
  });

  if (!user) redirect('/auth/login');

  return <AccountDashboard user={JSON.parse(JSON.stringify(user))} />;
}

