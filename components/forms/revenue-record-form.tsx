'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RevenueRecordFormProps {
  onSubmit: (data: any) => Promise<void>;
  clients?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
  defaultValues?: any;
  isEdit?: boolean;
}

export function RevenueRecordForm({
  onSubmit,
  clients = [],
  projects = [],
  defaultValues,
  isEdit = false,
}: RevenueRecordFormProps) {
  const [formData, setFormData] = useState({
    amount: defaultValues?.amount?.toString() || '',
    currency: defaultValues?.currency || 'USD',
    type: defaultValues?.type || '',
    status: defaultValues?.status || 'PENDING',
    description: defaultValues?.description || '',
    category: defaultValues?.category || '',
    source: defaultValues?.source || '',
    recurringPeriod: defaultValues?.recurringPeriod || '',
    periodStart: defaultValues?.periodStart ? new Date(defaultValues.periodStart) : undefined,
    periodEnd: defaultValues?.periodEnd ? new Date(defaultValues.periodEnd) : undefined,
    clientId: defaultValues?.clientId || '',
    projectId: defaultValues?.projectId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.type) {
      newErrors.type = 'Revenue type is required';
    }

    if (!formData.periodStart) {
      newErrors.periodStart = 'Period start date is required';
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = 'Period end date is required';
    }

    if (formData.periodStart && formData.periodEnd && formData.periodStart >= formData.periodEnd) {
      newErrors.periodEnd = 'Period end must be after period start';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        periodStart: formData.periodStart?.toISOString(),
        periodEnd: formData.periodEnd?.toISOString(),
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined,
        recurringPeriod: formData.recurringPeriod || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting revenue record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Revenue Record' : 'Create Revenue Record'}</CardTitle>
        <CardDescription>
          {isEdit ? 'Update revenue record details' : 'Add a new revenue record to track your earnings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Revenue Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTING">Consulting</SelectItem>
                  <SelectItem value="RETAINER">Retainer</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="COMMISSION">Commission</SelectItem>
                  <SelectItem value="BONUS">Bonus</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of the revenue"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Web Development, Marketing"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="e.g., Client name, referral source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              />
            </div>
          </div>

          {formData.type === 'SUBSCRIPTION' && (
            <div className="space-y-2">
              <Label htmlFor="recurringPeriod">Recurring Period</Label>
              <Select value={formData.recurringPeriod} onValueChange={(value) => handleInputChange('recurringPeriod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.periodStart && 'text-muted-foreground',
                      errors.periodStart && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.periodStart ? format(formData.periodStart, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.periodStart}
                    onSelect={(date) => handleInputChange('periodStart', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.periodStart && <p className="text-sm text-red-500">{errors.periodStart}</p>}
            </div>

            <div className="space-y-2">
              <Label>Period End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.periodEnd && 'text-muted-foreground',
                      errors.periodEnd && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.periodEnd ? format(formData.periodEnd, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.periodEnd}
                    onSelect={(date) => handleInputChange('periodEnd', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.periodEnd && <p className="text-sm text-red-500">{errors.periodEnd}</p>}
            </div>
          </div>

          {clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="clientId">Client (Optional)</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="projectId">Project (Optional)</Label>
              <Select value={formData.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Record' : 'Create Record'}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}