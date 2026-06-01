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

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Array<{ id: string; name: string }>;
}

interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
  serviceType: string;
  budgetAmount: string;
  startDate: string;
  endDate: string;
}

export function NewProjectModal({ open, onOpenChange, clients }: NewProjectModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    clientId: '',
    serviceType: '',
    budgetAmount: '',
    startDate: '',
    endDate: ''
  });

  const serviceTypes = [
    { value: 'CONSULTING', label: '🧠 Consulting' },
    { value: 'DEVELOPMENT', label: '💻 Development' },
    { value: 'DESIGN', label: '🎨 Design' },
    { value: 'MAINTENANCE', label: '🔧 Maintenance' },
    { value: 'SUPPORT', label: '🆘 Support' },
    { value: 'TRAINING', label: '📚 Training' },
    { value: 'OTHER', label: '📋 Other' }
  ];

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.clientId || !formData.serviceType) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();

      toast({
        title: "Project created",
        description: `${project.name} has been created successfully.`
      });

      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        clientId: '',
        serviceType: '',
        budgetAmount: '',
        startDate: '',
        endDate: ''
      });

      router.refresh();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
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
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project for one of your clients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">Client *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budgetAmount">Budget Amount</Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  value={formData.budgetAmount}
                  onChange={(e) => handleInputChange('budgetAmount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}