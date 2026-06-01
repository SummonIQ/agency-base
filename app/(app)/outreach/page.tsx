import { auth } from '@/lib/auth/server';
import { getOutreachActivities, getOutreachAnalytics } from '@/lib/outreach';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye
} from 'lucide-react';

const activityTypeIcons = {
  email: Mail,
  linkedin: Users,
  call: Phone,
  meeting: Calendar,
  text: MessageSquare,
  direct_mail: Mail,
};

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  opened: 'bg-purple-100 text-purple-800',
  responded: 'bg-emerald-100 text-emerald-800',
  ignored: 'bg-gray-100 text-gray-800',
  bounced: 'bg-red-100 text-red-800',
};

const statusIcons = {
  scheduled: Clock,
  sent: CheckCircle,
  delivered: CheckCircle,
  opened: Eye,
  responded: MessageSquare,
  ignored: XCircle,
  bounced: XCircle,
};

export default async function OutreachPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [activities, analytics] = await Promise.all([
    getOutreachActivities(session.user.id),
    getOutreachAnalytics(session.user.id),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Outreach Management</h1>
          <p className="text-muted-foreground">Track and manage your client outreach activities</p>
        </div>
        <div className="flex gap-2">
          <Link href="/outreach/templates">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/outreach/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Outreach
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.sentActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.respondedActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.overview.responseRate)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Templates */}
      {analytics.topTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Templates
            </CardTitle>
            <CardDescription>
              Templates with the highest response rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {template.timesSent} sent • {template.responsesReceived} responses
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{Math.round(template.responseRate)}%</div>
                    <div className="text-xs text-muted-foreground">response rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Outreach Activities</CardTitle>
              <CardDescription>
                Track the status of your outreach efforts
              </CardDescription>
            </div>
            <Link href="/outreach/analytics">
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No outreach activities yet</h3>
              <p className="text-muted-foreground mb-6">
                Start reaching out to potential clients to grow your business
              </p>
              <Link href="/outreach/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Outreach
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity) => {
                const TypeIcon = activityTypeIcons[activity.type as keyof typeof activityTypeIcons] || Mail;
                const StatusIcon = statusIcons[activity.status as keyof typeof statusIcons] || Clock;
                
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-muted rounded-lg">
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium truncate">
                          {activity.subject || `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} outreach`}
                        </div>
                        <Badge className={statusColors[activity.status as keyof typeof statusColors]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {activity.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.lead?.client?.name || activity.lead?.company || 'Unknown contact'}
                        {activity.template && ` • ${activity.template.name}`}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      {activity.scheduledFor && (
                        <div>Scheduled: {new Date(activity.scheduledFor).toLocaleDateString()}</div>
                      )}
                      {activity.sentAt && (
                        <div>Sent: {new Date(activity.sentAt).toLocaleDateString()}</div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              
              {activities.length > 10 && (
                <div className="text-center pt-4">
                  <Link href="/outreach/activities">
                    <Button variant="outline">
                      View All Activities ({activities.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}