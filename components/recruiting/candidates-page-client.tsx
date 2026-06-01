'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CandidateModal } from '@/components/modals/candidate-modal';

export function CandidatesPageActions() {
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsCandidateModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Candidate
      </Button>

      <CandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onSuccess={() => {
          // Page will refresh automatically via router.refresh() in modal
        }}
      />
    </>
  );
}