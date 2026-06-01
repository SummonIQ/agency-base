'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LinkedInSearchModal } from '@/components/linkedin/linkedin-search-modal';
import { LinkedInProfile } from '@/lib/linkedin/linkedin-service';
import { 
  Linkedin, 
  Users, 
  Search, 
  MessageSquare, 
  UserPlus, 
  TrendingUp,
  Settings,
  Play,
  Pause,
  Eye,
  Filter,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Target
} from 'lucide-react';

export default function LinkedInIntegration() {
  const [activeTab, setActiveTab] = useState('setup');
  const [isConnected, setIsConnected] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [prospects, setProspects] = useState<LinkedInProfile[]>([]);
  const [automationStats, setAutomationStats] = useState({
    connectionsToday: 0,
    messagesThisWeek: 0,
    acceptanceRate: 0,
    replyRate: 0,
    activeSequences: 0,
    totalProspects: 0,
  });
  const [loading, setLoading] = useState(false);

  // Load automation stats on mount
  useEffect(() => {
    loadAutomationStats();
  }, []);

  const loadAutomationStats = async () => {
    try {
      const response = await fetch('/api/linkedin/automation');
      const data = await response.json();
      
      if (data.success) {
        setAutomationStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load automation stats:', error);
    }
  };

  const handleProspectsFound = (newProspects: LinkedInProfile[]) => {
    setProspects(prev => [...prev, ...newProspects]);
    setActiveTab('prospects');
  };

  const handleSendConnectionRequest = async (profileId: string, message?: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/linkedin/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_connection_request',
          data: { profileId, message },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update prospect status or refresh data
        loadAutomationStats();
      }
    } catch (error) {
      console.error('Failed to send connection request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Linkedin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              LinkedIn Integration
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Automate LinkedIn outreach for recruiting and lead generation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="prospects" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prospects
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                    LinkedIn Recruiter Lite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Connect LinkedIn Recruiter Lite for advanced candidate sourcing
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm">Advanced search filters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm">InMail messaging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm">Candidate tracking</span>
                      </div>
                    </div>
                    <Button className="w-full" disabled={isConnected}>
                      <Linkedin className="h-4 w-4 mr-2" />
                      {isConnected ? 'Connected' : 'Connect Recruiter Lite'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      $140/month • Essential for recruiting business
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Linkedin className="h-6 w-6 text-blue-600" />
                    Sales Navigator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Optional: Sales Navigator for advanced lead generation
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm">Advanced lead search</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm">Lead recommendations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm">CRM integration</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect Sales Navigator
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      $80/month • Optional for lead generation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Safety Limits</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-connections">Daily connection requests</Label>
                        <Input id="daily-connections" type="number" defaultValue="20" className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-messages">Daily messages</Label>
                        <Input id="daily-messages" type="number" defaultValue="15" className="w-20" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Weekend activity</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto-accept connections</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-6 w-6" />
                  LinkedIn Prospect Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Search for LinkedIn prospects using advanced filters and add them to your pipeline.
                  </p>
                  <Button onClick={() => setSearchModalOpen(true)} size="lg">
                    <Search className="h-4 w-4 mr-2" />
                    Open LinkedIn Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Software Engineers in San Francisco</div>
                      <div className="text-sm text-muted-foreground">Technology industry • 47 results</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Search className="h-3 w-3 mr-1" />
                      Repeat
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">CTOs in Austin</div>
                      <div className="text-sm text-muted-foreground">Startup companies • 23 results</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Search className="h-3 w-3 mr-1" />
                      Repeat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-foreground">{automationStats.connectionsToday}</div>
                  <div className="text-sm text-muted-foreground">Connections Today</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-foreground">{automationStats.messagesThisWeek}</div>
                  <div className="text-sm text-muted-foreground">Messages This Week</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-foreground">{automationStats.acceptanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-foreground">{automationStats.activeSequences}</div>
                  <div className="text-sm text-muted-foreground">Active Sequences</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Automation Sequences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Recruiting Outreach Sequence</div>
                      <div className="text-sm text-muted-foreground">3 steps • 24 active prospects</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 dark:text-green-400">Active</Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Lead Generation Follow-up</div>
                      <div className="text-sm text-muted-foreground">2 steps • 12 active prospects</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 dark:text-green-400">Active</Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prospects Tab */}
          <TabsContent value="prospects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>LinkedIn Prospects ({prospects.length})</span>
                  <Button onClick={() => setSearchModalOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Prospects
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prospects.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Prospects Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by searching for LinkedIn prospects to add to your pipeline.
                    </p>
                    <Button onClick={() => setSearchModalOpen(true)}>
                      <Search className="h-4 w-4 mr-2" />
                      Search LinkedIn
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prospects.map((prospect) => (
                      <div key={prospect.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">
                              {prospect.firstName} {prospect.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {prospect.headline}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {prospect.company} • {prospect.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={prospect.connectionDegree === '1st' ? 'default' : 'secondary'}>
                            {prospect.connectionDegree}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendConnectionRequest(prospect.id)}
                            disabled={loading}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-foreground">{automationStats.connectionsToday}</div>
                      <div className="text-sm text-muted-foreground">Connections Sent</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-foreground">{automationStats.acceptanceRate}%</div>
                      <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-foreground">{automationStats.replyRate}%</div>
                      <div className="text-sm text-muted-foreground">Reply Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-foreground">{automationStats.totalProspects}</div>
                      <div className="text-sm text-muted-foreground">Total Prospects</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* LinkedIn Search Modal */}
        <LinkedInSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onProspectsFound={handleProspectsFound}
        />
      </div>
    </div>
  );
}
