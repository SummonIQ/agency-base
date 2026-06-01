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
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface CandidateFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: any;
  isEdit?: boolean;
}

export function CandidateForm({
  onSubmit,
  defaultValues,
  isEdit = false,
}: CandidateFormProps) {
  const [formData, setFormData] = useState({
    name: defaultValues?.name || '',
    email: defaultValues?.email || '',
    phone: defaultValues?.phone || '',
    location: defaultValues?.location || '',
    currentRole: defaultValues?.currentRole || '',
    experience: defaultValues?.experience || '',
    education: defaultValues?.education || '',
    skills: defaultValues?.skills || [],
    status: defaultValues?.status || 'new',
    rating: defaultValues?.rating?.toString() || '',
    resumeUrl: defaultValues?.resumeUrl || '',
    linkedInUrl: defaultValues?.linkedInUrl || '',
    portfolioUrl: defaultValues?.portfolioUrl || '',
    customFields: defaultValues?.customFields || {},
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.rating && (parseInt(formData.rating) < 1 || parseInt(formData.rating) > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    if (formData.resumeUrl && !/^https?:\/\/.+/.test(formData.resumeUrl)) {
      newErrors.resumeUrl = 'Please enter a valid URL';
    }

    if (formData.linkedInUrl && !/^https?:\/\/.+/.test(formData.linkedInUrl)) {
      newErrors.linkedInUrl = 'Please enter a valid URL';
    }

    if (formData.portfolioUrl && !/^https?:\/\/.+/.test(formData.portfolioUrl)) {
      newErrors.portfolioUrl = 'Please enter a valid URL';
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
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        resumeUrl: formData.resumeUrl || undefined,
        linkedInUrl: formData.linkedInUrl || undefined,
        portfolioUrl: formData.portfolioUrl || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        currentRole: formData.currentRole || undefined,
        experience: formData.experience || undefined,
        education: formData.education || undefined,
        customFields: Object.keys(formData.customFields).length > 0 ? formData.customFields : undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Candidate' : 'Add New Candidate'}</CardTitle>
        <CardDescription>
          {isEdit ? 'Update candidate information' : 'Add a new candidate to your talent pipeline'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="Senior Software Engineer"
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Input
                  id="experience"
                  placeholder="5+ years"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                placeholder="Bachelor's in Computer Science"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skills</h3>
            <div className="space-y-2">
              <Label htmlFor="skills">Add Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  placeholder="Enter a skill and press Enter"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status and Rating */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status & Rating</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rate the candidate"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  className={errors.rating ? 'border-red-500' : ''}
                />
                {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
              </div>
            </div>
          </div>

          {/* Links and Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Links & Documents</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  placeholder="https://example.com/resume.pdf"
                  value={formData.resumeUrl}
                  onChange={(e) => handleInputChange('resumeUrl', e.target.value)}
                  className={errors.resumeUrl ? 'border-red-500' : ''}
                />
                {errors.resumeUrl && <p className="text-sm text-red-500">{errors.resumeUrl}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="linkedInUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedInUrl}
                  onChange={(e) => handleInputChange('linkedInUrl', e.target.value)}
                  className={errors.linkedInUrl ? 'border-red-500' : ''}
                />
                {errors.linkedInUrl && <p className="text-sm text-red-500">{errors.linkedInUrl}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://portfolio.example.com"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                  className={errors.portfolioUrl ? 'border-red-500' : ''}
                />
                {errors.portfolioUrl && <p className="text-sm text-red-500">{errors.portfolioUrl}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-6 border-t">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Candidate' : 'Add Candidate'}
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