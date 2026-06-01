'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RevenueForecastModal } from '@/components/modals/revenue-forecast-modal';

export function ForecastPageActions() {
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsForecastModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Forecast
      </Button>

      <RevenueForecastModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        onSuccess={() => {
          // Page will refresh automatically via router.refresh() in modal
        }}
      />
    </>
  );
}