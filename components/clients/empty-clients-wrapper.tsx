'use client';

import { EmptyClients } from '@/components/ui/empty-state';
import { useRouter } from 'next/navigation';

export function EmptyClientsWrapper() {
  const router = useRouter();
  
  return (
    <EmptyClients 
      onAddClient={() => router.push('/clients/new')} 
    />
  );
}