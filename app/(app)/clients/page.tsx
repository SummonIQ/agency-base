import { auth } from '@/lib/auth/server';
import { getClients, getClientStats } from '@/lib/clients';
import { headers } from 'next/headers';
import { ClientsClient } from './clients-client';

export default async function ClientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [clients, stats] = await Promise.all([
    getClients(session.user.id),
    getClientStats(session.user.id),
  ]);

  return <ClientsClient clients={clients} stats={stats} />;
}