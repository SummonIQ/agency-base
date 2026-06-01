'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
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

interface RevenueForecastFormProps {
  onSubmit: (data: any) => Promise<void>;
  clients?: Array<{ id: string; name: string }>;
  projects?: Array<{ id: string; name: string }>;
  defaultValues?: any;
  isEdit?: boolean;
}

export function RevenueForecastForm({
  onSubmit,
  clients = [],
  projects = [],
  defaultValues,
  isEdit = false,
}: RevenueForecastFormProps) {
  const [formData, setFormData] = useState({
    amount: defaultValues?.amount?.toString() || '',
    confidence: defaultValues?.confidence || 50,
    currency: defaultValues?.currency || 'USD',
    type: defaultValues?.type || '',
    description: defaultValues?.description || '',
    source: defaultValues?.source || '',
    expectedDate: defaultValues?.expectedDate ? new Date(defaultValues.expectedDate) : undefined,
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

    if (!formData.expectedDate) {
      newErrors.expectedDate = 'Expected date is required';
    }

    if (formData.confidence < 0 || formData.confidence > 100) {
      newErrors.confidence = 'Confidence must be between 0 and 100';
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
        expectedDate: formData.expectedDate?.toISOString(),
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting revenue forecast:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 75) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Revenue Forecast' : 'Create Revenue Forecast'}</CardTitle>
        <CardDescription>
          {isEdit ? 'Update forecast details' : 'Add a new revenue forecast to predict future earnings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Forecasted Amount *</Label>
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

          <div className="space-y-3">
            <Label htmlFor="confidence">
              Confidence Level: {formData.confidence}%
              <span className={`ml-2 text-sm font-medium ${getConfidenceColor(formData.confidence)}`}>
                ({getConfidenceLabel(formData.confidence)})
              </span>
            </Label>
            <Slider
              id="confidence"
              min={0}
              max={100}
              step={1}
              value={[formData.confidence]}
              onValueChange={([value]) => handleInputChange('confidence', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (Very Unlikely)</span>
              <span>50% (Possible)</span>
              <span>100% (Certain)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Expected Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.expectedDate && 'text-muted-foreground',
                    errors.expectedDate && 'border-red-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expectedDate ? format(formData.expectedDate, 'PPP') : 'Pick expected date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expectedDate}
                  onSelect={(date) => handleInputChange('expectedDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.expectedDate && <p className="text-sm text-red-500">{errors.expectedDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of the forecast"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g., Pipeline deal, contract renewal, new opportunity"
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
            />
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

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Forecast Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Forecasted Amount:</span>
                <span className="font-medium">
                  {formData.amount ? `${formData.currency} ${parseFloat(formData.amount).toLocaleString()}` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confidence Level:</span>
                <span className={`font-medium ${getConfidenceColor(formData.confidence)}`}>
                  {formData.confidence}% ({getConfidenceLabel(formData.confidence)})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Weighted Amount:</span>
                <span className="font-medium">
                  {formData.amount
                    ? `${formData.currency} ${(parseFloat(formData.amount) * (formData.confidence / 100)).toLocaleString()}`
                    : 'Not calculated'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Forecast' : 'Create Forecast'}
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