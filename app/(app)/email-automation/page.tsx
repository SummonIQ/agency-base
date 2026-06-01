'use client';

import { useState, useEffect } from 'react';
import { SendEmailModal } from '@/components/email/send-email-modal';
import { TemplateModal } from '@/components/modals/template-modal';
import { SequenceModal } from '@/components/modals/sequence-modal';
import { EmailProviderSetup } from '@/components/email/email-provider-setup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, 
  Send, 
  Clock, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  textContent?: string;
  type: 'RECRUITING' | 'LEAD_GEN' | 'FOLLOW_UP' | 'CLIENT' | 'NURTURING' | 'NOTIFICATION';
  isActive: boolean;
  variables: string[];
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  isActive: boolean;
  maxEmails?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    recipients: number;
    steps: number;
  };
}

export default function EmailAutomation() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sendEmailModal, setSendEmailModal] = useState<{ isOpen: boolean; template?: EmailTemplate }>({ isOpen: false });
  const [templateModal, setTemplateModal] = useState(false);
  const [sequenceModal, setSequenceModal] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Load templates and sequences on component mount
  useEffect(() => {
    checkConfiguration();
    loadTemplates();
    loadSequences();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/email/configuration');
      const data = await response.json();
      setIsConfigured(data.configured || false);
    } catch (error) {
      console.error('Failed to check configuration:', error);
      setIsConfigured(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/email/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadSequences = async () => {
    try {
      const response = await fetch('/api/email/sequences');
      const data = await response.json();
      if (data.success) {
        setSequences(data.sequences);
      }
    } catch (error) {
      console.error('Failed to load sequences:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RECRUITING': return 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200';
      case 'LEAD_GEN': return 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200';
      case 'FOLLOW_UP': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200';
      case 'CLIENT': return 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200';
      case 'NURTURING': return 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200';
      case 'NOTIFICATION': return 'bg-gray-100 dark:bg-gray-950/50 text-gray-800 dark:text-gray-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200';
      case 'PAUSED': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200';
      case 'DRAFT': return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
      case 'COMPLETED': return 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200';
      case 'CANCELLED': return 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'active' : 'inactive';
  };

  const calculateOpenRate = (template: EmailTemplate) => {
    return template.sentCount > 0 ? Math.round((template.openCount / template.sentCount) * 100) : 0;
  };

  const calculateReplyRate = (template: EmailTemplate) => {
    return template.sentCount > 0 ? Math.round((template.replyCount / template.sentCount) * 100) : 0;
  };

  const getTotalStats = () => {
    const totals = templates.reduce((acc, template) => {
      acc.sent += template.sentCount;
      acc.opened += template.openCount;
      acc.replied += template.replyCount;
      acc.clicked += template.clickCount;
      return acc;
    }, { sent: 0, opened: 0, replied: 0, clicked: 0 });

    return {
      ...totals,
      openRate: totals.sent > 0 ? Math.round((totals.opened / totals.sent) * 100) : 0,
      replyRate: totals.sent > 0 ? Math.round((totals.replied / totals.sent) * 100) : 0,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Email Automation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Automate your outreach with intelligent email sequences and tracking
          </p>
        </div>

        {/* Setup Notice */}
        {!isConfigured && !showSetup && (
          <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-foreground">
                  To activate email automation, you need to configure an email service provider:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">SendGrid (Recommended)</h3>
                    <p className="text-sm text-muted-foreground mb-3">$15-50/month • Easy setup • Great deliverability</p>
                    <Button variant="outline" size="sm" onClick={() => setShowSetup(true)}>
                      Configure SendGrid
                    </Button>
                  </div>
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Mailgun</h3>
                    <p className="text-sm text-muted-foreground mb-3">$35+/month • Developer-friendly • Advanced features</p>
                    <Button variant="outline" size="sm" onClick={() => setShowSetup(true)}>
                      Configure Mailgun
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Setup */}
        {showSetup && (
          <Card>
            <CardContent className="p-6">
              <EmailProviderSetup
                onSetupComplete={() => {
                  setShowSetup(false);
                  setIsConfigured(true);
                  checkConfiguration();
                }}
              />
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="sequences" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sequences
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg text-muted-foreground">Loading dashboard...</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-muted-foreground">Total Sent</span>
                      </div>
                      <div className="text-3xl font-bold text-foreground">{getTotalStats().sent}</div>
                      <div className="text-sm text-muted-foreground">{templates.length} templates</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-muted-foreground">Open Rate</span>
                      </div>
                      <div className="text-3xl font-bold text-foreground">{getTotalStats().openRate}%</div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {getTotalStats().openRate > 25 ? 'Above average' : 'Needs improvement'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-muted-foreground">Reply Rate</span>
                      </div>
                      <div className="text-3xl font-bold text-foreground">{getTotalStats().replyRate}%</div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        {getTotalStats().replyRate > 10 ? 'Excellent' : 'Room for improvement'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-medium text-muted-foreground">Active Sequences</span>
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {sequences.filter(s => s.status === 'ACTIVE').length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sequences.reduce((total, seq) => total + seq._count.recipients, 0)} total recipients
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Reply received from John Smith</p>
                      <p className="text-sm text-gray-600">Recruiting Outreach Sequence • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Email opened by Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Agency Lead Generation • 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">New subscriber added to sequence</p>
                      <p className="text-sm text-gray-600">Cold Lead Generation • 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Email Templates</h2>
              <Button
                className="flex items-center gap-2"
                onClick={() => setTemplateModal(true)}
              >
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(template.type)}>
                          {template.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(template.isActive ? 'ACTIVE' : 'DRAFT')}>
                          {template.isActive ? 'ACTIVE' : 'DRAFT'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {template.content}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sent:</span>
                          <span className="font-semibold ml-2">{template.sentCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Open Rate:</span>
                          <span className="font-semibold ml-2">{calculateOpenRate(template)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Replies:</span>
                          <span className="font-semibold ml-2">{template.replyCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reply Rate:</span>
                          <span className="font-semibold ml-2">{calculateReplyRate(template)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => setSendEmailModal({ isOpen: true, template })}
                        >
                          <Send className="h-3 w-3" />
                          Send
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          {template.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {template.isActive ? 'Pause' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sequences Tab */}
          <TabsContent value="sequences" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Email Sequences</h2>
              <Button
                className="flex items-center gap-2"
                onClick={() => setSequenceModal(true)}
              >
                <Plus className="h-4 w-4" />
                New Sequence
              </Button>
            </div>

            <div className="space-y-4">
              {sequences.map((sequence) => (
                <Card key={sequence.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{sequence.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{sequence.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(sequence.status)}>
                          {sequence.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {sequence._count.recipients} recipients
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {sequence._count.steps > 0 ? (
                          Array.from({ length: sequence._count.steps }, (_, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                Email {index + 1}
                              </div>
                              {index < sequence._count.steps - 1 && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  1d
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">No steps configured</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Settings className="h-3 w-3" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          {sequence.status === 'ACTIVE' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          {sequence.status === 'ACTIVE' ? 'Pause' : 'Start'}
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Manage Subscribers
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Email Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Template Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div>
                        <span className="font-medium">Recruiting</span>
                        <p className="text-sm text-muted-foreground">45 sent • 71% open • 27% reply</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Excellent</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div>
                        <span className="font-medium">Lead Generation</span>
                        <p className="text-sm text-muted-foreground">67 sent • 61% open • 12% reply</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Good</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div>
                        <span className="font-medium">Follow-up</span>
                        <p className="text-sm text-muted-foreground">23 sent • 78% open • 17% reply</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Very Good</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Performing Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Tuesday 10:00 AM</span>
                      <span className="font-semibold">78% open rate</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Wednesday 2:00 PM</span>
                      <span className="font-semibold">72% open rate</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Thursday 9:00 AM</span>
                      <span className="font-semibold">69% open rate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={sendEmailModal.isOpen}
        onClose={() => setSendEmailModal({ isOpen: false })}
        template={sendEmailModal.template}
        onEmailSent={(result) => {
          console.log('Email sent:', result);
          // TODO: Update template stats
        }}
      />

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModal}
        onClose={() => setTemplateModal(false)}
        onSuccess={() => {
          loadTemplates();
        }}
      />

      {/* Sequence Modal */}
      <SequenceModal
        isOpen={sequenceModal}
        onClose={() => setSequenceModal(false)}
        onSuccess={() => {
          loadSequences();
        }}
      />
    </div>
  );
}
