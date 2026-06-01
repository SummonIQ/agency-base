'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Zap,
  Users,
  Mail,
  TrendingUp,
  Target,
  Clock,
  Settings,
  Play,
  Pause,
  BarChart3,
  Loader2
} from 'lucide-react';

interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  meetings: number;
}

interface AgencyLead {
  id: string;
  title: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  status: string;
  estimatedValue?: number;
}

export default function CampaignsClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [leads, setLeads] = useState<AgencyLead[]>([]);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    selectedLeads: [] as string[],
    agencyName: 'Your Agency',
    businessHoursOnly: true,
    weekdaysOnly: true,
    startHour: 9,
    endHour: 17,
    timezone: 'America/New_York'
  });

  useEffect(() => {
    Promise.all([
      fetchLeads(),
      fetchMetrics()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/lead-generation/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.filter((lead: AgencyLead) => lead.contactEmail && lead.status !== 'WON'));
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/lead-generation/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_metrics',
          data: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name.trim()) {
      toast({
        title: 'Campaign name required',
        description: 'Please enter a name for your campaign',
        variant: 'destructive'
      });
      return;
    }

    if (campaignForm.selectedLeads.length === 0) {
      toast({
        title: 'No leads selected',
        description: 'Please select at least one lead for your campaign',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);

    try {
      // Simple sequence: initial email + follow-up after 3 days
      const sequence = [
        {
          templateId: 'tech-startup-intro',
          stepNumber: 1,
          waitDays: 0
        },
        {
          templateId: 'follow-up-no-response',
          stepNumber: 2,
          waitDays: 3
        }
      ];

      const response = await fetch('/api/lead-generation/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          data: {
            name: campaignForm.name,
            description: campaignForm.description,
            leadIds: campaignForm.selectedLeads,
            config: {
              sequence,
              agencyName: campaignForm.agencyName,
              businessHoursOnly: campaignForm.businessHoursOnly,
              weekdaysOnly: campaignForm.weekdaysOnly,
              startHour: campaignForm.startHour,
              endHour: campaignForm.endHour,
              timezone: campaignForm.timezone
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const result = await response.json();

      toast({
        title: 'Campaign created',
        description: `Campaign "${campaignForm.name}" has been created with ${result.successCount} leads scheduled`,
        variant: 'default'
      });

      setShowCreateDialog(false);
      setCampaignForm({
        name: '',
        description: '',
        selectedLeads: [],
        agencyName: 'Your Agency',
        businessHoursOnly: true,
        weekdaysOnly: true,
        startHour: 9,
        endHour: 17,
        timezone: 'America/New_York'
      });

      // Refresh data
      fetchMetrics();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast({
        title: 'Campaign creation failed',
        description: 'There was an error creating your campaign. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setCampaignForm(prev => ({
      ...prev,
      selectedLeads: prev.selectedLeads.includes(leadId)
        ? prev.selectedLeads.filter(id => id !== leadId)
        : [...prev.selectedLeads, leadId]
    }));
  };

  const selectAllLeads = () => {
    setCampaignForm(prev => ({
      ...prev,
      selectedLeads: leads.map(lead => lead.id)
    }));
  };

  const clearSelection = () => {
    setCampaignForm(prev => ({
      ...prev,
      selectedLeads: []
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Outreach Campaigns</h1>
          <p className="text-muted-foreground">Automated email sequences and follow-ups</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Outreach Campaign</DialogTitle>
              <DialogDescription>
                Set up an automated email sequence to nurture your leads
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Campaign Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Campaign Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm(prev => ({...prev, name: e.target.value}))}
                      placeholder="e.g., Tech Startup Outreach Q4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agencyName">Agency Name</Label>
                    <Input
                      id="agencyName"
                      value={campaignForm.agencyName}
                      onChange={(e) => setCampaignForm(prev => ({...prev, agencyName: e.target.value}))}
                      placeholder="Your Agency Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe your campaign goals and strategy"
                  />
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule Settings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={campaignForm.timezone} onValueChange={(value) => setCampaignForm(prev => ({...prev, timezone: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="startHour">Start Hour</Label>
                      <Select value={campaignForm.startHour.toString()} onValueChange={(value) => setCampaignForm(prev => ({...prev, startHour: parseInt(value)}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 24}, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endHour">End Hour</Label>
                      <Select value={campaignForm.endHour.toString()} onValueChange={(value) => setCampaignForm(prev => ({...prev, endHour: parseInt(value)}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 24}, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="businessHours"
                      checked={campaignForm.businessHoursOnly}
                      onCheckedChange={(checked) => setCampaignForm(prev => ({...prev, businessHoursOnly: !!checked}))}
                    />
                    <Label htmlFor="businessHours">Business hours only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekdays"
                      checked={campaignForm.weekdaysOnly}
                      onCheckedChange={(checked) => setCampaignForm(prev => ({...prev, weekdaysOnly: !!checked}))}
                    />
                    <Label htmlFor="weekdays">Weekdays only</Label>
                  </div>
                </div>
              </div>

              {/* Lead Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Select Leads ({campaignForm.selectedLeads.length} selected)</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllLeads}>
                      Select All ({leads.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                  {leads.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No eligible leads found. Leads need an email address to be included in campaigns.
                    </p>
                  ) : (
                    leads.map((lead) => (
                      <div key={lead.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                        <Checkbox
                          id={lead.id}
                          checked={campaignForm.selectedLeads.includes(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                        />
                        <Label htmlFor={lead.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{lead.companyName}</div>
                              <div className="text-sm text-muted-foreground">
                                {lead.contactName} • {lead.contactEmail}
                              </div>
                            </div>
                            <Badge variant="outline">{lead.status}</Badge>
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Create Campaign
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sent}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.delivered} delivered ({((metrics.delivered / metrics.sent) * 100 || 0).toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((metrics.opened / metrics.sent) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.opened} opens
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((metrics.replied / metrics.sent) * 100 || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.replied} replies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meetings</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.meetings}</div>
              <p className="text-xs text-muted-foreground">
                {((metrics.meetings / metrics.sent) * 100 || 0).toFixed(1)}% conversion
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Campaign Status
          </CardTitle>
          <CardDescription>
            Automated outreach campaigns are now available with email service integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <div className="font-medium">Email Service</div>
                  <div className="text-sm text-muted-foreground">
                    {process.env.EMAIL_PROVIDER === 'mock' ? 'Mock Provider (Development)' : 'Production Email Service'}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-200">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Background Processing</div>
                  <div className="text-sm text-muted-foreground">
                    Scheduled outreach activities are processed automatically
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-200">
                Ready
              </Badge>
            </div>

            {leads.length === 0 && (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No eligible leads</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You need leads with email addresses to create campaigns.
                </p>
                <Button variant="outline" onClick={() => router.push('/lead-generation/search')}>
                  <Users className="mr-2 h-4 w-4" />
                  Find Prospects
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}