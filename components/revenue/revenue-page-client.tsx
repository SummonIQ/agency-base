'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RevenueRecordModal } from '@/components/modals/revenue-record-modal';

export function RevenuePageActions() {
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsRevenueModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Revenue
      </Button>

      <RevenueRecordModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        onSuccess={() => {
          // Page will refresh automatically via router.refresh() in modal
        }}
      />
    </>
  );
}