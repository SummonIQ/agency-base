import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Mail,
  Plus,
  Send,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';

async function getEmailCampaigns(userId: string) {
  try {
    const campaigns = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3030'}/api/email-automation/campaigns`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${userId}`, // Simplified for demo
      },
    });

    if (!campaigns.ok) {
      console.error('Failed to fetch campaigns');
      return [];
    }

    return await campaigns.json();
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

export default async function EmailCampaignsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const campaigns = await getEmailCampaigns(session.user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOpenRate = (opened: number, sent: number) => {
    if (sent === 0) return 0;
    return Math.round((opened / sent) * 100);
  };

  const calculateClickRate = (clicked: number, opened: number) => {
    if (opened === 0) return 0;
    return Math.round((clicked / opened) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">Manage and track your email marketing campaigns</p>
        </div>
        <Link href="/email-automation/campaigns/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.sent, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-green-600">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          const openRate = calculateOpenRate(campaign.opened, campaign.sent);
          const clickRate = calculateClickRate(campaign.clicked, campaign.opened);

          return (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.type}</Badge>
                        {campaign.scheduledDate && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {campaign.scheduledDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'active' ? (
                      <Button variant="outline" size="sm">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    ) : campaign.status === 'draft' ? (
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3 mr-1" />
                        Launch
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      Recipients
                    </div>
                    <div className="font-semibold">{campaign.recipients.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Send className="h-3 w-3" />
                      Sent
                    </div>
                    <div className="font-semibold">{campaign.sent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Eye className="h-3 w-3" />
                      Open Rate
                    </div>
                    <div className="font-semibold">{openRate}%</div>
                    <Progress value={openRate} className="mt-1 h-2" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <MousePointer className="h-3 w-3" />
                      Click Rate
                    </div>
                    <div className="font-semibold">{clickRate}%</div>
                    <Progress value={clickRate} className="mt-1 h-2" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      Performance
                    </div>
                    <div className="font-semibold text-green-600">Above Average</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first email campaign to start engaging with your audience
            </p>
            <Link href="/email-automation/campaigns/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}