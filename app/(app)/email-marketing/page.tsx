'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Send, 
  Users, 
  Mail, 
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Eye,
  MousePointer,
  UserPlus,
  List,
  Calendar,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Download,
  Upload
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'automation';
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  scheduledDate?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    recipients: number;
    opens: number;
    clicks: number;
  };
}

interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: string;
  lastActivity?: string;
  customFields?: any;
}

interface SubscriberList {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    subscribers: number;
  };
}

interface OverviewStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalLists: number;
  avgOpenRate: number;
  avgClickRate: number;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

const TYPE_COLORS = {
  newsletter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  promotional: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  transactional: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  automation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export default function EmailMarketingPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [lists, setLists] = useState<SubscriberList[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, typeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch overview stats
      const overviewResponse = await fetch('/api/email/marketing?action=overview');
      const overviewData = await overviewResponse.json();
      if (overviewData.success) {
        setOverview(overviewData.overview);
      }

      // Fetch campaigns
      const campaignParams = new URLSearchParams();
      if (statusFilter !== 'all') campaignParams.append('status', statusFilter);
      if (typeFilter !== 'all') campaignParams.append('type', typeFilter);
      
      const campaignsResponse = await fetch(`/api/email/marketing?action=campaigns&${campaignParams}`);
      const campaignsData = await campaignsResponse.json();
      if (campaignsData.success) {
        setCampaigns(campaignsData.campaigns);
      }

      // Fetch subscribers
      const subscribersResponse = await fetch('/api/email/marketing?action=subscribers');
      const subscribersData = await subscribersResponse.json();
      if (subscribersData.success) {
        setSubscribers(subscribersData.subscribers);
      }

      // Fetch lists
      const listsResponse = await fetch('/api/email/marketing?action=lists');
      const listsData = await listsResponse.json();
      if (listsData.success) {
        setLists(listsData.lists);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async (campaignData: {
    name: string;
    type: 'newsletter' | 'promotional' | 'transactional' | 'automation';
    subject: string;
    content: string;
  }) => {
    try {
      const response = await fetch('/api/email/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_campaign',
          data: campaignData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const createSubscriber = async (subscriberData: {
    email: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const response = await fetch('/api/email/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_subscriber',
          data: subscriberData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create subscriber:', error);
    }
  };

  const createList = async (listData: {
    name: string;
    description?: string;
  }) => {
    try {
      const response = await fetch('/api/email/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_list',
          data: listData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CampaignCard = ({ campaign }: { campaign: EmailCampaign }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{campaign.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={TYPE_COLORS[campaign.type]}>
              {campaign.type}
            </Badge>
            <Badge className={STATUS_COLORS[campaign.status]}>
              {campaign.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-lg">{campaign._count?.recipients || 0}</div>
            <div className="text-muted-foreground">Recipients</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{campaign._count?.opens || 0}</div>
            <div className="text-muted-foreground">Opens</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{campaign._count?.clicks || 0}</div>
            <div className="text-muted-foreground">Clicks</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button variant="ghost" size="sm">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-muted-foreground">
            Manage campaigns, subscribers, and email performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overview && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Subscribers</p>
                        <p className="text-2xl font-bold">{overview.totalSubscribers.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Campaigns</p>
                        <p className="text-2xl font-bold">{overview.totalCampaigns}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                        <p className="text-2xl font-bold">{overview.avgOpenRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <MousePointer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Click Rate</p>
                        <p className="text-2xl font-bold">{overview.avgClickRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                          </div>
                          <Badge className={STATUS_COLORS[campaign.status]}>
                            {campaign.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscriber Lists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lists.slice(0, 5).map((list) => (
                        <div key={list.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{list.name}</p>
                            <p className="text-sm text-muted-foreground">{list.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{list._count?.subscribers || 0}</p>
                            <p className="text-sm text-muted-foreground">subscribers</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Campaigns Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Create your first email campaign to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Subscribed</th>
                      <th className="text-left p-4 font-medium">Last Activity</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{subscriber.email}</td>
                        <td className="p-4">
                          {subscriber.firstName || subscriber.lastName
                            ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                            : '-'
                          }
                        </td>
                        <td className="p-4">
                          <Badge variant={subscriber.status === 'active' ? 'default' : 'secondary'}>
                            {subscriber.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {subscriber.lastActivity
                            ? new Date(subscriber.lastActivity).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lists..."
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <Card key={list.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{list.name}</CardTitle>
                  {list.description && (
                    <p className="text-sm text-muted-foreground">{list.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{list._count?.subscribers || 0}</p>
                      <p className="text-sm text-muted-foreground">subscribers</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
