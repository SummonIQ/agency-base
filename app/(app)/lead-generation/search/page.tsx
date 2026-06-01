import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import ProspectSearchClient from './client';

export default async function ProspectSearchPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return <ProspectSearchClient />;
}
