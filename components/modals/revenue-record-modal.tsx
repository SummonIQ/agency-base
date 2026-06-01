'use client';

import { useState, useEffect } from 'react';
import { ModalWrapper } from './modal-wrapper';
import { RevenueRecordForm } from '@/components/forms/revenue-record-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RevenueRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultValues?: any;
  isEdit?: boolean;
}

export function RevenueRecordModal({
  isOpen,
  onClose,
  onSuccess,
  defaultValues,
  isEdit = false,
}: RevenueRecordModalProps) {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchProjects();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data.map((client: any) => ({
          id: client.id,
          name: client.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.map((project: any) => ({
          id: project.id,
          name: project.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/revenue-analytics/revenue/${defaultValues?.id}`
        : '/api/revenue-analytics/revenue';

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
        throw new Error(error.error || `Failed to ${isEdit ? 'update' : 'create'} revenue record`);
      }

      toast.success(`Revenue record ${isEdit ? 'updated' : 'created'} successfully!`);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      router.refresh(); // Refresh the current page to show new data
    } catch (error) {
      console.error('Error submitting revenue record:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Revenue Record' : 'Create Revenue Record'}
      description={isEdit ? 'Update revenue record details' : 'Add a new revenue record to track your earnings'}
      size="lg"
    >
      <RevenueRecordForm
        onSubmit={handleSubmit}
        clients={clients}
        projects={projects}
        defaultValues={defaultValues}
        isEdit={isEdit}
      />
    </ModalWrapper>
  );
}