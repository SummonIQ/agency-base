'use client';

import { useState } from 'react';
import { ModalWrapper } from './modal-wrapper';
import { ClientForm } from '@/components/forms/client-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultValues?: any;
  isEdit?: boolean;
}

export function ClientModal({
  isOpen,
  onClose,
  onSuccess,
  defaultValues,
  isEdit = false,
}: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/clients/${defaultValues?.id}`
        : '/api/clients';

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
        throw new Error(error.error || `Failed to ${isEdit ? 'update' : 'create'} client`);
      }

      toast.success(`Client ${isEdit ? 'updated' : 'added'} successfully!`);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      router.refresh(); // Refresh the current page to show new data
    } catch (error) {
      console.error('Error submitting client:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Client' : 'Add New Client'}
      description={isEdit ? 'Update client information' : 'Add a new client to your portfolio'}
      size="xl"
    >
      <ClientForm
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        isEdit={isEdit}
      />
    </ModalWrapper>
  );
}