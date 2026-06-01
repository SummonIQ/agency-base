'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeadFormData {
  title: string;
  description: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  estimatedValue: string;
  source: string;
}

export function NewLeadModal({ open, onOpenChange }: NewLeadModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    title: '',
    description: '',
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    estimatedValue: '',
    source: 'COLD_OUTREACH'
  });

  const sourceOptions = [
    { value: 'WEBSITE', label: 'Website' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'COLD_OUTREACH', label: 'Cold Outreach' },
    { value: 'INBOUND', label: 'Inbound' },
    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
    { value: 'PLATFORM_UPWORK', label: 'Upwork' },
    { value: 'PLATFORM_TOPTAL', label: 'Toptal' },
    { value: 'PLATFORM_CONTRA', label: 'Contra' },
    { value: 'PLATFORM_FIVERR', label: 'Fiverr' },
    { value: 'NETWORKING_EVENT', label: 'Networking Event' }
  ];

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.companyName.trim()) {
      toast({
        title: "Missing required fields",
        description: "Title and company name are required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Transform data to match the API format
      const leadData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        source: formData.source,
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        contactPhone: formData.contactPhone.trim() || null,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        probability: 25, // Default probability for new leads
      };

      const response = await fetch('/api/lead-generation/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lead');
      }

      const lead = await response.json();

      toast({
        title: "Lead created",
        description: `${lead.title} has been added to your pipeline.`
      });

      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        companyName: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        estimatedValue: '',
        source: 'COLD_OUTREACH'
      });

      router.refresh();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lead. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Create a new lead to track potential business opportunities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Lead Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., TechCorp - CTO Search"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                placeholder="50000"
                min="0"
                step="1000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the opportunity"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}