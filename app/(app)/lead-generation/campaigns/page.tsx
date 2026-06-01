import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import CampaignsClient from './client';

export default async function CampaignsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return <CampaignsClient />;
}