import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import LeadGenerationClient from './client';

export default async function LeadGenerationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return <LeadGenerationClient />;
}
