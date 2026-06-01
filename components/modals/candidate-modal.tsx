'use client';

import { useState } from 'react';
import { ModalWrapper } from './modal-wrapper';
import { CandidateForm } from '@/components/forms/candidate-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultValues?: any;
  isEdit?: boolean;
}

export function CandidateModal({
  isOpen,
  onClose,
  onSuccess,
  defaultValues,
  isEdit = false,
}: CandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/recruiting/candidates/${defaultValues?.id}`
        : '/api/recruiting/candidates';

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEdit ? 'update' : 'create'} candidate`);
      }

      toast.success(`Candidate ${isEdit ? 'updated' : 'added'} successfully!`);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      router.refresh(); // Refresh the current page to show new data
    } catch (error) {
      console.error('Error submitting candidate:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Candidate' : 'Add New Candidate'}
      description={isEdit ? 'Update candidate information' : 'Add a new candidate to your talent pipeline'}
      size="xl"
    >
      <CandidateForm
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        isEdit={isEdit}
      />
    </ModalWrapper>
  );
}