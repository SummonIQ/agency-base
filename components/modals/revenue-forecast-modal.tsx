'use client';

import { useState, useEffect } from 'react';
import { ModalWrapper } from './modal-wrapper';
import { RevenueForecastForm } from '@/components/forms/revenue-forecast-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RevenueForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultValues?: any;
  isEdit?: boolean;
}

export function RevenueForecastModal({
  isOpen,
  onClose,
  onSuccess,
  defaultValues,
  isEdit = false,
}: RevenueForecastModalProps) {
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
        ? `/api/revenue-analytics/forecasts/${defaultValues?.id}`
        : '/api/revenue-analytics/forecasts';

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
        throw new Error(error.error || `Failed to ${isEdit ? 'update' : 'create'} revenue forecast`);
      }

      toast.success(`Revenue forecast ${isEdit ? 'updated' : 'created'} successfully!`);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      router.refresh(); // Refresh the current page to show new data
    } catch (error) {
      console.error('Error submitting revenue forecast:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Revenue Forecast' : 'Create Revenue Forecast'}
      description={isEdit ? 'Update forecast details' : 'Add a new revenue forecast to predict future earnings'}
      size="lg"
    >
      <RevenueForecastForm
        onSubmit={handleSubmit}
        clients={clients}
        projects={projects}
        defaultValues={defaultValues}
        isEdit={isEdit}
      />
    </ModalWrapper>
  );
}