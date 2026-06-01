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

interface ClientFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
  isEdit?: boolean;
}

export function ClientForm({
  onSubmit,
  defaultValues,
  isEdit = false,
}: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: defaultValues?.name || '',
    email: defaultValues?.email || '',
    phone: defaultValues?.phone || '',
    website: defaultValues?.website || '',
    industry: defaultValues?.industry || '',
    companySize: defaultValues?.companySize || '',
    status: defaultValues?.status || 'PROSPECT',
    source: defaultValues?.source || '',
    notes: defaultValues?.notes || '',
    primaryContactName: defaultValues?.primaryContactName || '',
    primaryContactEmail: defaultValues?.primaryContactEmail || '',
    primaryContactPhone: defaultValues?.primaryContactPhone || '',
    primaryContactRole: defaultValues?.primaryContactRole || '',
    annualRevenue: defaultValues?.annualRevenue?.toString() || '',
    employeeCount: defaultValues?.employeeCount?.toString() || '',
    founded: defaultValues?.founded ? new Date(defaultValues.founded) : undefined,
    description: defaultValues?.description || '',
    firstContactDate: defaultValues?.firstContactDate ? new Date(defaultValues.firstContactDate) : undefined,
    nextFollowUpDate: defaultValues?.nextFollowUpDate ? new Date(defaultValues.nextFollowUpDate) : undefined,
    creditLimit: defaultValues?.creditLimit?.toString() || '',
    paymentTermsDays: defaultValues?.paymentTermsDays?.toString() || '30',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.primaryContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContactEmail)) {
      newErrors.primaryContactEmail = 'Please enter a valid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (include http:// or https://)';
    }

    if (formData.annualRevenue && parseFloat(formData.annualRevenue) < 0) {
      newErrors.annualRevenue = 'Annual revenue must be positive';
    }

    if (formData.employeeCount && parseInt(formData.employeeCount) < 1) {
      newErrors.employeeCount = 'Employee count must be at least 1';
    }

    if (formData.creditLimit && parseFloat(formData.creditLimit) < 0) {
      newErrors.creditLimit = 'Credit limit must be positive';
    }

    if (formData.paymentTermsDays && parseInt(formData.paymentTermsDays) < 1) {
      newErrors.paymentTermsDays = 'Payment terms must be at least 1 day';
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
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        source: formData.source || undefined,
        notes: formData.notes || undefined,
        primaryContactName: formData.primaryContactName || undefined,
        primaryContactEmail: formData.primaryContactEmail || undefined,
        primaryContactPhone: formData.primaryContactPhone || undefined,
        primaryContactRole: formData.primaryContactRole || undefined,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
        founded: formData.founded?.toISOString(),
        description: formData.description || undefined,
        firstContactDate: formData.firstContactDate?.toISOString(),
        nextFollowUpDate: formData.nextFollowUpDate?.toISOString(),
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        paymentTermsDays: parseInt(formData.paymentTermsDays),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Client' : 'Add New Client'}</CardTitle>
        <CardDescription>
          {isEdit ? 'Update client information' : 'Add a new client to your portfolio'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@acme.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://acme.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={errors.website ? 'border-red-500' : ''}
                />
                {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Technology, Healthcare, Finance..."
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STARTUP">Startup (1-10)</SelectItem>
                    <SelectItem value="SMALL">Small (11-50)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (51-200)</SelectItem>
                    <SelectItem value="LARGE">Large (201-1000)</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  placeholder="1000000"
                  value={formData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                  className={errors.annualRevenue ? 'border-red-500' : ''}
                />
                {errors.annualRevenue && <p className="text-sm text-red-500">{errors.annualRevenue}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  placeholder="50"
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  className={errors.employeeCount ? 'border-red-500' : ''}
                />
                {errors.employeeCount && <p className="text-sm text-red-500">{errors.employeeCount}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the company..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Primary Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryContactName">Contact Name</Label>
                <Input
                  id="primaryContactName"
                  placeholder="John Doe"
                  value={formData.primaryContactName}
                  onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactRole">Contact Role</Label>
                <Input
                  id="primaryContactRole"
                  placeholder="CEO, CTO, Marketing Director..."
                  value={formData.primaryContactRole}
                  onChange={(e) => handleInputChange('primaryContactRole', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Contact Email</Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  placeholder="john@acme.com"
                  value={formData.primaryContactEmail}
                  onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                  className={errors.primaryContactEmail ? 'border-red-500' : ''}
                />
                {errors.primaryContactEmail && <p className="text-sm text-red-500">{errors.primaryContactEmail}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryContactPhone">Contact Phone</Label>
                <Input
                  id="primaryContactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.primaryContactPhone}
                  onChange={(e) => handleInputChange('primaryContactPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status and Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Relationship</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Client Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="CHURNED">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="How did you find this client?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRECT">Direct</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                    <SelectItem value="ADVERTISING">Advertising</SelectItem>
                    <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  placeholder="50000"
                  value={formData.creditLimit}
                  onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                  className={errors.creditLimit ? 'border-red-500' : ''}
                />
                {errors.creditLimit && <p className="text-sm text-red-500">{errors.creditLimit}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTermsDays">Payment Terms (Days)</Label>
                <Input
                  id="paymentTermsDays"
                  type="number"
                  placeholder="30"
                  value={formData.paymentTermsDays}
                  onChange={(e) => handleInputChange('paymentTermsDays', e.target.value)}
                  className={errors.paymentTermsDays ? 'border-red-500' : ''}
                />
                {errors.paymentTermsDays && <p className="text-sm text-red-500">{errors.paymentTermsDays}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the client..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Client' : 'Add Client'}
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