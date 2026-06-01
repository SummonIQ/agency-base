'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  UserPlus, 
  Plus, 
  Edit, 
  Copy, 
  Trash2,
  Eye,
  Play,
  Users,
  Target,
  Clock
} from 'lucide-react';

export interface RecruitingTemplate {
  id: string;
  name: string;
  type: 'connection_request' | 'initial_message' | 'follow_up' | 'interview_invite' | 'offer_discussion';
  category: 'technical' | 'leadership' | 'startup' | 'enterprise';
  subject?: string;
  content: string;
  variables: string[];
  tags: string[];
  performance: {
    sent: number;
    accepted: number;
    replied: number;
    acceptanceRate: number;
    replyRate: number;
  };
  createdAt: string;
  lastUsed?: string;
}

export interface RecruitingSequence {
  id: string;
  name: string;
  description: string;
  category: 'technical_sourcing' | 'leadership_hunt' | 'passive_nurture' | 'referral_request';
  steps: SequenceStep[];
  isActive: boolean;
  settings: {
    dailyLimit: number;
    respectWorkingHours: boolean;
    workingHours: { start: string; end: string };
    timezone: string;
    stopOnReply: boolean;
    waitOnWeekends: boolean;
  };
  stats: {
    totalRecipients: number;
    activeRecipients: number;
    completedRecipients: number;
    responseRate: number;
    connectionRate: number;
  };
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  type: 'connection_request' | 'message' | 'wait' | 'follow_up';
  templateId?: string;
  template?: RecruitingTemplate;
  delay: {
    value: number;
    unit: 'hours' | 'days';
    respectWeekends: boolean;
  };
  isActive: boolean;
  conditions?: {
    onlyIfConnected?: boolean;
    onlyIfNotReplied?: boolean;
  };
}

const RECRUITING_TEMPLATES: RecruitingTemplate[] = [
  {
    id: 'template_1',
    name: 'Technical Connection Request - Senior Engineers',
    type: 'connection_request',
    category: 'technical',
    content: `Hi {{firstName}},

I noticed your impressive background in {{techStack}} at {{company}}. I'm working with some exciting {{industry}} companies who are looking for senior engineers with your exact skill set.

Would love to connect and share some opportunities that might interest you.

Best regards,
{{recruiterName}}`,
    variables: ['firstName', 'techStack', 'company', 'industry', 'recruiterName'],
    tags: ['technical', 'senior', 'connection'],
    performance: {
      sent: 145,
      accepted: 89,
      replied: 34,
      acceptanceRate: 61.4,
      replyRate: 23.4
    },
    createdAt: '2024-01-01',
    lastUsed: '2024-01-15'
  },
  {
    id: 'template_2',
    name: 'Follow-up - Tech Role Discussion',
    type: 'follow_up',
    category: 'technical',
    content: `Hi {{firstName}},

Thanks for connecting! I wanted to reach out about an exciting {{role}} opportunity at {{clientCompany}}.

Key details:
• {{salaryRange}} compensation
• {{location}} ({{remotePolicy}})
• Tech stack: {{techStack}}
• Team of {{teamSize}} engineers

The company is {{companyDescription}} and they're specifically looking for someone with your {{keySkills}} experience.

Would you be open to a brief 15-minute call this week to discuss? I can share more details about the role and answer any questions.

Best,
{{recruiterName}}`,
    variables: ['firstName', 'role', 'clientCompany', 'salaryRange', 'location', 'remotePolicy', 'techStack', 'teamSize', 'companyDescription', 'keySkills', 'recruiterName'],
    tags: ['follow-up', 'technical', 'opportunity'],
    performance: {
      sent: 89,
      accepted: 0,
      replied: 31,
      acceptanceRate: 0,
      replyRate: 34.8
    },
    createdAt: '2024-01-02',
    lastUsed: '2024-01-14'
  },
  {
    id: 'template_3',
    name: 'Leadership Connection - CTOs/VPs',
    type: 'connection_request',
    category: 'leadership',
    content: `Hi {{firstName}},

Your experience scaling engineering teams at {{company}} caught my attention. I'm working with a {{fundingStage}} {{industry}} company that's looking for technical leadership to drive their next growth phase.

The opportunity involves {{keyResponsibilities}} and leading a team of {{teamSize}}+ engineers.

Would love to connect and share more details.

Best,
{{recruiterName}}`,
    variables: ['firstName', 'company', 'fundingStage', 'industry', 'keyResponsibilities', 'teamSize', 'recruiterName'],
    tags: ['leadership', 'cto', 'vp', 'scaling'],
    performance: {
      sent: 67,
      accepted: 34,
      replied: 18,
      acceptanceRate: 50.7,
      replyRate: 26.9
    },
    createdAt: '2024-01-03',
    lastUsed: '2024-01-13'
  },
  {
    id: 'template_4',
    name: 'Passive Candidate Nurture',
    type: 'initial_message',
    category: 'startup',
    content: `Hi {{firstName}},

Hope you're doing well at {{company}}! I came across your work on {{project}} and was really impressed.

I'm not reaching out about any specific opportunity right now, but I work with some amazing {{industry}} startups and scale-ups that are always looking for exceptional {{role}} talent.

If you're ever curious about what's out there or want to chat about the market, I'd be happy to connect. No pressure at all!

Cheers,
{{recruiterName}}`,
    variables: ['firstName', 'company', 'project', 'industry', 'role', 'recruiterName'],
    tags: ['passive', 'nurture', 'startup', 'no-pressure'],
    performance: {
      sent: 234,
      accepted: 0,
      replied: 43,
      acceptanceRate: 0,
      replyRate: 18.4
    },
    createdAt: '2024-01-04',
    lastUsed: '2024-01-16'
  },
  {
    id: 'template_5',
    name: 'Referral Request - Employee Network',
    type: 'initial_message',
    category: 'enterprise',
    content: `Hi {{firstName}},

Hope this finds you well! I'm working on an exciting {{role}} search for {{clientCompany}}, and given your network in the {{industry}} space, I thought you might know some great candidates.

The role is for:
• {{role}} position
• {{location}} based
• {{salaryRange}} range
• Key requirements: {{keyRequirements}}

If anyone from your network comes to mind who might be interested, I'd be grateful for an introduction. Happy to share more details about the opportunity.

Thanks in advance!
{{recruiterName}}`,
    variables: ['firstName', 'role', 'clientCompany', 'industry', 'location', 'salaryRange', 'keyRequirements', 'recruiterName'],
    tags: ['referral', 'network', 'enterprise', 'introduction'],
    performance: {
      sent: 156,
      accepted: 0,
      replied: 38,
      acceptanceRate: 0,
      replyRate: 24.4
    },
    createdAt: '2024-01-05',
    lastUsed: '2024-01-12'
  }
];

interface RecruitingTemplatesProps {
  templates?: RecruitingTemplate[];
  sequences?: RecruitingSequence[];
  onCreateTemplate: (template: Partial<RecruitingTemplate>) => void;
  onCreateSequence: (sequence: Partial<RecruitingSequence>) => void;
  onEditTemplate: (templateId: string, updates: Partial<RecruitingTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export function RecruitingTemplates({
  templates = RECRUITING_TEMPLATES,
  sequences = [],
  onCreateTemplate,
  onCreateSequence,
  onEditTemplate,
  onDeleteTemplate
}: RecruitingTemplatesProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'sequences'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<RecruitingTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'connection_request': return 'bg-blue-100 text-blue-800';
      case 'initial_message': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'interview_invite': return 'bg-purple-100 text-purple-800';
      case 'offer_discussion': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-indigo-100 text-indigo-800';
      case 'leadership': return 'bg-orange-100 text-orange-800';
      case 'startup': return 'bg-teal-100 text-teal-800';
      case 'enterprise': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recruiting Templates & Sequences</h2>
          <p className="text-gray-600">Manage outreach templates and automated sequences for technical recruiting</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Sequence
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <Play className="h-4 w-4 mr-2" />
            Sequences ({sequences.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedTemplate(template)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {template.content.substring(0, 120)}...
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {template.performance.acceptanceRate}%
                        </div>
                        <div className="text-xs text-gray-500">Accept Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {template.performance.replyRate}%
                        </div>
                        <div className="text-xs text-gray-500">Reply Rate</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Used {template.performance.sent} times • Last used {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          {sequences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Recruiting Sequences Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create automated sequences to streamline your recruiting outreach
                </p>
                <Button onClick={() => onCreateSequence({})}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Sequence
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sequences.map((sequence) => (
                <Card key={sequence.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{sequence.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{sequence.description}</p>
                      </div>
                      <Badge className={sequence.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {sequence.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Steps:</span>
                        <span className="font-medium">{sequence.steps.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Active Recipients:</span>
                        <span className="font-medium">{sequence.stats.activeRecipients}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Response Rate:</span>
                        <span className="font-medium text-green-600">{sequence.stats.responseRate}%</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4 mr-1" />
                          Add Recipients
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getTypeColor(selectedTemplate.type)}>
                      {selectedTemplate.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getCategoryColor(selectedTemplate.category)}>
                      {selectedTemplate.category}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-semibold">Content:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                  {selectedTemplate.content}
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Variables:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.map(variable => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Performance:</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold">{selectedTemplate.performance.sent}</div>
                    <div className="text-sm text-gray-600">Sent</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-semibold text-green-600">{selectedTemplate.performance.acceptanceRate}%</div>
                    <div className="text-sm text-gray-600">Accept Rate</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {/* Copy template */}}>
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button variant="outline" onClick={() => {/* Edit template */}}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
