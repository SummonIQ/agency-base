'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Mail, 
  MessageCircle, 
  Clock, 
  Users, 
  BarChart3,
  Settings,
  ArrowDown,
  ArrowUp,
  Edit,
  Copy,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { AutomationStatus, AutomationTrigger, AutomationStepType } from '@prisma/client';

interface SequenceStep {
  id?: string;
  stepNumber: number;
  type: AutomationStepType;
  name: string;
  delayDays: number;
  delayHours: number;
  templateId?: string;
  customContent?: string;
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'exists' | 'not_exists';
    value?: string;
  }>;
}

interface SequenceBuilderProps {
  sequenceId?: string;
  initialData?: {
    name: string;
    description?: string;
    type: 'EMAIL' | 'LINKEDIN' | 'MIXED';
    trigger: AutomationTrigger;
    targetAudience?: any;
    steps?: SequenceStep[];
  };
  onSave?: (sequenceData: any) => void;
  onCancel?: () => void;
}

const SEQUENCE_TYPES = [
  { value: 'EMAIL', label: 'Email Only', description: 'Email-based automation sequence' },
  { value: 'LINKEDIN', label: 'LinkedIn Only', description: 'LinkedIn-based automation sequence' },
  { value: 'MIXED', label: 'Multi-Channel', description: 'Combined email and LinkedIn sequence' },
];

const TRIGGER_TYPES = [
  { value: 'MANUAL', label: 'Manual', description: 'Start manually when recipients are added' },
  { value: 'LEAD_CREATED', label: 'New Lead', description: 'Start when a new lead is created' },
  { value: 'PROSPECT_CONNECTED', label: 'LinkedIn Connection', description: 'Start when LinkedIn connection is accepted' },
  { value: 'EMAIL_OPENED', label: 'Email Opened', description: 'Start when previous email is opened' },
  { value: 'FORM_SUBMITTED', label: 'Form Submitted', description: 'Start when contact form is submitted' },
];

const STEP_TYPES = [
  { value: 'EMAIL', label: 'Send Email', icon: Mail, description: 'Send an email to the recipient' },
  { value: 'LINKEDIN_CONNECTION', label: 'LinkedIn Connection', icon: Users, description: 'Send LinkedIn connection request' },
  { value: 'LINKEDIN_MESSAGE', label: 'LinkedIn Message', icon: MessageCircle, description: 'Send LinkedIn message' },
  { value: 'WAIT', label: 'Wait', icon: Clock, description: 'Wait for a specified time period' },
  { value: 'CONDITION', label: 'Condition', icon: Zap, description: 'Branch based on conditions' },
];

export function SequenceBuilder({ 
  sequenceId, 
  initialData, 
  onSave, 
  onCancel 
}: SequenceBuilderProps) {
  const [sequenceData, setSequenceData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'EMAIL' as const,
    trigger: initialData?.trigger || 'MANUAL' as AutomationTrigger,
    targetAudience: initialData?.targetAudience || {},
  });

  const [steps, setSteps] = useState<SequenceStep[]>(initialData?.steps || []);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [editingStep, setEditingStep] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email/templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const addStep = (type: AutomationStepType) => {
    const newStep: SequenceStep = {
      stepNumber: steps.length + 1,
      type,
      name: `${STEP_TYPES.find(t => t.value === type)?.label} ${steps.length + 1}`,
      delayDays: type === 'WAIT' ? 1 : 0,
      delayHours: type === 'WAIT' ? 0 : 2,
      customContent: '',
      conditions: [],
    };

    setSteps([...steps, newStep]);
    setEditingStep(steps.length);
  };

  const updateStep = (index: number, updatedStep: Partial<SequenceStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updatedStep };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));
    setSteps(renumberedSteps);
    setEditingStep(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));
    
    setSteps(renumberedSteps);
  };

  const duplicateStep = (index: number) => {
    const stepToDuplicate = steps[index];
    const newStep: SequenceStep = {
      ...stepToDuplicate,
      stepNumber: steps.length + 1,
      name: `${stepToDuplicate.name} (Copy)`,
    };
    
    setSteps([...steps, newStep]);
  };

  const handleSave = async () => {
    if (!sequenceData.name.trim()) {
      alert('Please enter a sequence name');
      return;
    }

    if (steps.length === 0) {
      alert('Please add at least one step to the sequence');
      return;
    }

    setIsLoading(true);
    try {
      // First save the sequence
      const sequenceResponse = await fetch('/api/automation/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: sequenceId ? 'update_sequence' : 'create_sequence',
          data: sequenceId 
            ? { sequenceId, ...sequenceData }
            : sequenceData,
        }),
      });

      const sequenceResult = await sequenceResponse.json();
      if (!sequenceResult.success) {
        throw new Error('Failed to save sequence');
      }

      const savedSequenceId = sequenceResult.sequence.id;

      // Then save all steps
      for (const step of steps) {
        const stepResponse = await fetch('/api/automation/sequences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: step.id ? 'update_step' : 'add_step',
            data: step.id 
              ? { stepId: step.id, ...step }
              : { sequenceId: savedSequenceId, ...step },
          }),
        });

        const stepResult = await stepResponse.json();
        if (!stepResult.success) {
          throw new Error(`Failed to save step ${step.stepNumber}`);
        }
      }

      onSave?.(sequenceResult.sequence);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save sequence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StepEditor = ({ step, index }: { step: SequenceStep; index: number }) => {
    const StepIcon = STEP_TYPES.find(t => t.value === step.type)?.icon || Mail;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {step.stepNumber}
              </div>
              <StepIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-sm">{step.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {STEP_TYPES.find(t => t.value === step.type)?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingStep(editingStep === index ? null : index)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateStep(index)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStep(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {editingStep === index && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Step Name</Label>
                <Input
                  value={step.name}
                  onChange={(e) => updateStep(index, { name: e.target.value })}
                  placeholder="Enter step name"
                />
              </div>
              <div className="space-y-2">
                <Label>Step Type</Label>
                <Select
                  value={step.type}
                  onValueChange={(value: AutomationStepType) => updateStep(index, { type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delay (Days)</Label>
                <Input
                  type="number"
                  min="0"
                  value={step.delayDays}
                  onChange={(e) => updateStep(index, { delayDays: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Delay (Hours)</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={step.delayHours}
                  onChange={(e) => updateStep(index, { delayHours: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {(step.type === 'EMAIL' || step.type === 'LINKEDIN_MESSAGE') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template (Optional)</Label>
                  <Select
                    value={step.templateId || ''}
                    onValueChange={(value) => updateStep(index, { templateId: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template or use custom content" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No template (use custom content)</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Content</Label>
                  <Textarea
                    value={step.customContent || ''}
                    onChange={(e) => updateStep(index, { customContent: e.target.value })}
                    placeholder={step.type === 'EMAIL' 
                      ? "Enter email content or leave empty to use template"
                      : "Enter LinkedIn message content"
                    }
                    rows={4}
                  />
                </div>
              </div>
            )}

            {step.type === 'LINKEDIN_CONNECTION' && (
              <div className="space-y-2">
                <Label>Connection Message</Label>
                <Textarea
                  value={step.customContent || ''}
                  onChange={(e) => updateStep(index, { customContent: e.target.value })}
                  placeholder="I'd like to connect with you on LinkedIn."
                  rows={3}
                />
              </div>
            )}

            {step.type === 'WAIT' && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This step will wait {step.delayDays} days and {step.delayHours} hours before proceeding to the next step.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {sequenceId ? 'Edit Sequence' : 'Create Automation Sequence'}
          </h1>
          <p className="text-muted-foreground">
            Build multi-step automation sequences for email and LinkedIn outreach
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Sequence'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">
            <Settings className="h-4 w-4 mr-2" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Users className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step Types Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Add Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {STEP_TYPES.map((stepType) => {
                    const Icon = stepType.icon;
                    return (
                      <Button
                        key={stepType.value}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => addStep(stepType.value as AutomationStepType)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div className="text-left">
                            <div className="font-medium text-sm">{stepType.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {stepType.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Sequence Steps */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Sequence Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  {steps.length === 0 ? (
                    <div className="text-center py-12">
                      <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Add steps to build your automation sequence
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {steps.map((step, index) => (
                        <div key={index}>
                          <StepEditor step={step} index={index} />
                          {index < steps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ArrowDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sequence Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Sequence Name</Label>
                  <Input
                    id="name"
                    value={sequenceData.name}
                    onChange={(e) => setSequenceData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter sequence name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Sequence Type</Label>
                  <Select
                    value={sequenceData.type}
                    onValueChange={(value: 'EMAIL' | 'LINKEDIN' | 'MIXED') => 
                      setSequenceData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEQUENCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={sequenceData.description}
                  onChange={(e) => setSequenceData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this sequence"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger</Label>
                <Select
                  value={sequenceData.trigger}
                  onValueChange={(value: AutomationTrigger) => 
                    setSequenceData(prev => ({ ...prev, trigger: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div>
                          <div className="font-medium">{trigger.label}</div>
                          <div className="text-xs text-muted-foreground">{trigger.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sequence Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Analytics will be available after the sequence is saved and activated
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
