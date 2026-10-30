import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/auth/login?redirect=/account/profile');
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });
  if (!user) redirect('/auth/login');
  return <ProfileClient user={JSON.parse(JSON.stringify(user))} />;
}

