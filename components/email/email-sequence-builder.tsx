'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Clock, 
  Mail, 
  Users, 
  Target,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  ArrowDown
} from 'lucide-react';

export interface SequenceStep {
  id: string;
  stepNumber: number;
  name: string;
  templateId: string;
  templateName?: string;
  delay: {
    type: 'immediate' | 'delay' | 'business_days';
    value?: number;
    unit?: 'minutes' | 'hours' | 'days';
  };
  isActive: boolean;
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  category: 'lead_generation' | 'recruiting' | 'nurture' | 'onboarding';
  isActive: boolean;
  steps: SequenceStep[];
  settings: {
    fromEmail: string;
    fromName: string;
    sendingHours: { start: string; end: string };
    maxEmailsPerDay: number;
    stopOnReply: boolean;
  };
  stats: {
    totalRecipients: number;
    activeRecipients: number;
    completedRecipients: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  };
}

interface EmailSequenceBuilderProps {
  sequence?: EmailSequence;
  templates: Array<{ id: string; name: string; category: string }>;
  onSave: (sequence: Partial<EmailSequence>) => void;
  onCancel: () => void;
}

export function EmailSequenceBuilder({ 
  sequence, 
  templates, 
  onSave, 
  onCancel 
}: EmailSequenceBuilderProps) {
  const [formData, setFormData] = useState<Partial<EmailSequence>>({
    name: '',
    description: '',
    category: 'lead_generation',
    isActive: true,
    steps: [],
    settings: {
      fromEmail: 'hello@agencybase.com',
      fromName: 'AgencyBase',
      sendingHours: { start: '09:00', end: '17:00' },
      maxEmailsPerDay: 50,
      stopOnReply: true,
    },
    ...sequence
  });

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const addStep = () => {
    const newStep: SequenceStep = {
      id: `step_${Date.now()}`,
      stepNumber: (formData.steps?.length || 0) + 1,
      name: `Step ${(formData.steps?.length || 0) + 1}`,
      templateId: '',
      delay: { type: 'delay', value: 1, unit: 'days' },
      isActive: true,
    };

    setFormData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));

    setExpandedSteps(prev => new Set([...prev, newStep.id]));
  };

  const updateStep = (stepId: string, updates: Partial<SequenceStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || []
    }));
  };

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || []
    }));

    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepId);
      return newSet;
    });
  };

  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getDelayText = (delay: SequenceStep['delay']) => {
    if (delay.type === 'immediate') return 'Send immediately';
    if (delay.type === 'business_days') return `Wait ${delay.value} business days`;
    return `Wait ${delay.value} ${delay.unit}`;
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {sequence ? 'Edit Sequence' : 'Create Email Sequence'}
          </h2>
          <p className="text-gray-600">
            Build automated email sequences to nurture leads and engage prospects
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {sequence ? 'Update Sequence' : 'Create Sequence'}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Sequence Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Sequence Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Cold Outreach - Tech Companies"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_generation">Lead Generation</SelectItem>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="nurture">Nurture</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and goals of this sequence"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="active">Active sequence</Label>
          </div>
        </CardContent>
      </Card>

      {/* Sequence Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Steps</CardTitle>
            <Button onClick={addStep} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.steps?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No steps added yet. Click "Add Step" to get started.
            </div>
          ) : (
            formData.steps?.map((step, index) => (
              <div key={step.id} className="border rounded-lg">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleStepExpanded(step.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSteps.has(step.id) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Step {step.stepNumber}
                      </Badge>
                      <span className="font-medium">{step.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {getDelayText(step.delay)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStep(step.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedSteps.has(step.id) && (
                  <div className="border-t p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Step Name</Label>
                        <Input
                          value={step.name}
                          onChange={(e) => updateStep(step.id, { name: e.target.value })}
                          placeholder="Initial Outreach"
                        />
                      </div>
                      <div>
                        <Label>Email Template</Label>
                        <Select
                          value={step.templateId}
                          onValueChange={(value) => updateStep(step.id, { 
                            templateId: value,
                            templateName: templates.find(t => t.id === value)?.name 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Delay Type</Label>
                        <Select
                          value={step.delay.type}
                          onValueChange={(value) => updateStep(step.id, {
                            delay: { ...step.delay, type: value as any }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Send Immediately</SelectItem>
                            <SelectItem value="delay">Wait Duration</SelectItem>
                            <SelectItem value="business_days">Business Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {step.delay.type !== 'immediate' && (
                        <>
                          <div>
                            <Label>Wait Time</Label>
                            <Input
                              type="number"
                              value={step.delay.value || 1}
                              onChange={(e) => updateStep(step.id, {
                                delay: { ...step.delay, value: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                          {step.delay.type === 'delay' && (
                            <div>
                              <Label>Unit</Label>
                              <Select
                                value={step.delay.unit}
                                onValueChange={(value) => updateStep(step.id, {
                                  delay: { ...step.delay, unit: value as any }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minutes">Minutes</SelectItem>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={step.isActive}
                        onCheckedChange={(checked) => updateStep(step.id, { isActive: checked })}
                      />
                      <Label>Step is active</Label>
                    </div>
                  </div>
                )}

                {index < (formData.steps?.length || 0) - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Sequence Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sending Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>From Email</Label>
              <Input
                value={formData.settings?.fromEmail}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings!, fromEmail: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label>From Name</Label>
              <Input
                value={formData.settings?.fromName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings!, fromName: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Sending Start</Label>
              <Input
                type="time"
                value={formData.settings?.sendingHours.start}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings!,
                    sendingHours: { ...prev.settings!.sendingHours, start: e.target.value }
                  }
                }))}
              />
            </div>
            <div>
              <Label>Sending End</Label>
              <Input
                type="time"
                value={formData.settings?.sendingHours.end}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings!,
                    sendingHours: { ...prev.settings!.sendingHours, end: e.target.value }
                  }
                }))}
              />
            </div>
            <div>
              <Label>Max Emails/Day</Label>
              <Input
                type="number"
                value={formData.settings?.maxEmailsPerDay}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings!, maxEmailsPerDay: parseInt(e.target.value) }
                }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.settings?.stopOnReply}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings!, stopOnReply: checked }
              }))}
            />
            <Label>Stop sequence when recipient replies</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
