'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Users,
  Send,
  MessageSquare,
  UserPlus,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Linkedin,
  ExternalLink,
} from 'lucide-react';

interface LinkedInProfile {
  publicIdentifier: string;
  firstName: string;
  lastName: string;
  headline?: string;
  summary?: string;
  location?: string;
  industry?: string;
  connectionDegree?: string;
  profileUrl?: string;
  companyName?: string;
  position?: string;
}

interface LinkedInMetrics {
  total: number;
  connectionRequests: {
    sent: number;
    pending: number;
    failed: number;
  };
  messages: {
    sent: number;
    pending: number;
    failed: number;
  };
}

export default function LinkedInClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LinkedInProfile[]>([]);
  const [metrics, setMetrics] = useState<LinkedInMetrics | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

  const [searchForm, setSearchForm] = useState({
    keywords: '',
    company: '',
    title: '',
    location: '',
    industry: '',
    connectionDegree: 'any',
    limit: '20'
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    connectionMessage: 'Hi {{firstName}}, I noticed your work at {{company}}. I\'d love to connect and share some insights about the industry.',
    followUpMessage: 'Thanks for connecting! I\'d love to learn more about {{company}}\'s current challenges and see how we might be able to help.',
    delayHours: '24'
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/lead-generation/linkedin?action=metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_profiles',
          data: {
            ...searchForm,
            limit: parseInt(searchForm.limit)
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data.profiles);
        toast({
          title: 'Search completed',
          description: `Found ${data.data.profiles.length} profiles`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (profile: LinkedInProfile) => {
    try {
      const response = await fetch('/api/lead-generation/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_connection_request',
          data: {
            profileId: profile.publicIdentifier,
            message: campaignForm.connectionMessage
              .replace('{{firstName}}', profile.firstName)
              .replace('{{lastName}}', profile.lastName)
              .replace('{{company}}', profile.companyName || 'your company')
              .replace('{{position}}', profile.position || 'your role')
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Connection request sent',
          description: `Sent connection request to ${profile.firstName} ${profile.lastName}`,
        });
        fetchMetrics(); // Refresh metrics
      } else {
        throw new Error(result.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Connection request error:', error);
      toast({
        title: 'Connection request failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCampaign = async () => {
    if (selectedProfiles.length === 0) {
      toast({
        title: 'No profiles selected',
        description: 'Please select at least one profile for the campaign',
        variant: 'destructive'
      });
      return;
    }

    if (!campaignForm.name.trim()) {
      toast({
        title: 'Campaign name required',
        description: 'Please provide a name for your campaign',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const sequence = [
        {
          type: 'connection_request' as const,
          delay: 0,
          template: campaignForm.connectionMessage,
          message: campaignForm.connectionMessage
        },
        {
          type: 'message' as const,
          delay: parseInt(campaignForm.delayHours),
          template: campaignForm.followUpMessage,
          message: campaignForm.followUpMessage
        }
      ];

      const response = await fetch('/api/lead-generation/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          data: {
            name: campaignForm.name,
            profiles: selectedProfiles,
            sequence
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Campaign created',
          description: `LinkedIn campaign "${campaignForm.name}" created successfully`,
        });
        setSelectedProfiles([]);
        setCampaignForm({
          name: '',
          connectionMessage: 'Hi {{firstName}}, I noticed your work at {{company}}. I\'d love to connect and share some insights about the industry.',
          followUpMessage: 'Thanks for connecting! I\'d love to learn more about {{company}}\'s current challenges and see how we might be able to help.',
          delayHours: '24'
        });
        fetchMetrics(); // Refresh metrics
      } else {
        throw new Error(result.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast({
        title: 'Campaign creation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProfileSelection = (profileId: string) => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Linkedin className="h-8 w-8 text-blue-600" />
            LinkedIn Automation
          </h1>
          <p className="text-muted-foreground">Automate LinkedIn outreach and connection building</p>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Requests</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.connectionRequests.sent}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.connectionRequests.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.messages.sent}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.messages.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.total > 0 ? Math.round(((metrics.connectionRequests.sent + metrics.messages.sent) / metrics.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Profile Search</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Profile Search</CardTitle>
              <CardDescription>
                Find potential prospects on LinkedIn using search criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={searchForm.keywords}
                    onChange={(e) => setSearchForm(prev => ({...prev, keywords: e.target.value}))}
                    placeholder="e.g., CEO, founder, startup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={searchForm.company}
                    onChange={(e) => setSearchForm(prev => ({...prev, company: e.target.value}))}
                    placeholder="e.g., TechCorp, StartupXYZ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={searchForm.title}
                    onChange={(e) => setSearchForm(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., Chief Executive Officer"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={searchForm.location}
                    onChange={(e) => setSearchForm(prev => ({...prev, location: e.target.value}))}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={searchForm.industry}
                    onChange={(e) => setSearchForm(prev => ({...prev, industry: e.target.value}))}
                    placeholder="e.g., Technology, Software"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connectionDegree">Connection</Label>
                  <Select value={searchForm.connectionDegree} onValueChange={(value) => setSearchForm(prev => ({...prev, connectionDegree: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any connection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any connection</SelectItem>
                      <SelectItem value="1st">1st connections</SelectItem>
                      <SelectItem value="2nd">2nd connections</SelectItem>
                      <SelectItem value="3rd">3rd+ connections</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="limit">Results limit:</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={searchForm.limit}
                    onChange={(e) => setSearchForm(prev => ({...prev, limit: e.target.value}))}
                    className="w-20"
                    min="1"
                    max="100"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Profiles
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Search Results</CardTitle>
                    <CardDescription>Found {searchResults.length} profiles</CardDescription>
                  </div>
                  {selectedProfiles.length > 0 && (
                    <Badge variant="secondary">
                      {selectedProfiles.length} selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {searchResults.map((profile) => (
                  <div
                    key={profile.publicIdentifier}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      selectedProfiles.includes(profile.publicIdentifier)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleProfileSelection(profile.publicIdentifier)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          {profile.connectionDegree && (
                            <Badge variant="outline" className="text-xs">
                              {profile.connectionDegree}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {profile.headline}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {profile.companyName && (
                            <span>{profile.companyName}</span>
                          )}
                          {profile.location && (
                            <span>{profile.location}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendConnectionRequest(profile);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={profile.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create LinkedIn Campaign</CardTitle>
              <CardDescription>
                Set up automated LinkedIn outreach sequences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Q4 Tech Outreach"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionMessage">Connection Request Message</Label>
                <Textarea
                  id="connectionMessage"
                  value={campaignForm.connectionMessage}
                  onChange={(e) => setCampaignForm(prev => ({...prev, connectionMessage: e.target.value}))}
                  rows={3}
                  placeholder="Use variables like {{firstName}}, {{company}}, {{position}}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUpMessage">Follow-up Message</Label>
                <Textarea
                  id="followUpMessage"
                  value={campaignForm.followUpMessage}
                  onChange={(e) => setCampaignForm(prev => ({...prev, followUpMessage: e.target.value}))}
                  rows={3}
                  placeholder="Message to send after connection is accepted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delayHours">Follow-up Delay (hours)</Label>
                <Input
                  id="delayHours"
                  type="number"
                  value={campaignForm.delayHours}
                  onChange={(e) => setCampaignForm(prev => ({...prev, delayHours: e.target.value}))}
                  min="1"
                  max="168"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedProfiles.length} profiles selected for campaign
                </div>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={loading || selectedProfiles.length === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Activity History</h3>
              <p className="text-sm text-muted-foreground">
                LinkedIn activity history and performance tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}