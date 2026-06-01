import { auth } from '@/lib/auth/server';
import { getTimeEntries, getTimeTrackingAnalytics } from '@/lib/time-tracking';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Clock,
  DollarSign,
  TrendingUp,
  Play,
  Pause,
  Square,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import TimeEntryActions from '@/components/time-tracking/time-entry-actions';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  INVOICED: 'bg-purple-100 text-purple-800',
  PAID: 'bg-emerald-100 text-emerald-800',
};

const statusIcons = {
  DRAFT: AlertCircle,
  SUBMITTED: Clock,
  APPROVED: CheckCircle,
  INVOICED: DollarSign,
  PAID: CheckCircle,
};

export default async function TimeTrackingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [timeEntries, analytics] = await Promise.all([
    getTimeEntries(session.user.id),
    getTimeTrackingAnalytics(session.user.id),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">Track time spent on projects and tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/time-tracking/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Time Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.billableHours.toFixed(1)}h billable
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${analytics.summary.averageHourlyRate.toFixed(0)}/hr average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.utilizationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Billable hours ratio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5h</div>
            <p className="text-xs text-muted-foreground">
              +2.5h from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Timer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Quick Timer
          </CardTitle>
          <CardDescription>
            Start tracking time for a project or task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Project</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option>Select project...</option>
                  <option>Website Redesign</option>
                  <option>Mobile App Development</option>
                  <option>Brand Identity</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Task (Optional)</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option>Select task...</option>
                  <option>Design wireframes</option>
                  <option>Frontend development</option>
                  <option>Testing</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input 
                  type="text" 
                  placeholder="What are you working on?"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Time Entries</CardTitle>
              <CardDescription>
                Track and manage your time entries
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Submit Selected
              </Button>
              <Link href="/time-tracking/bulk-edit">
                <Button variant="outline" size="sm">
                  Bulk Edit
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No time entries yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking time on your projects to monitor productivity
              </p>
              <Link href="/time-tracking/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Time Entry
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.slice(0, 10).map((entry) => {
                const StatusIcon = statusIcons[entry.status as keyof typeof statusIcons] || Clock;
                
                return (
                  <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <div className="p-2 bg-muted rounded-lg">
                        <Clock className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium truncate">
                          {entry.description}
                        </div>
                        <Badge className={statusColors[entry.status as keyof typeof statusColors]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {entry.status.toLowerCase()}
                        </Badge>
                        {!entry.billable && (
                          <Badge variant="outline">Non-billable</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.project.client?.name} • {entry.project.name}
                        {entry.task && ` • ${entry.task.name}`}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">{entry.hours}h</div>
                      {entry.hourlyRate && (
                        <div className="text-sm text-muted-foreground">
                          ${entry.hourlyRate}/hr
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        {entry.totalAmount ? `$${entry.totalAmount.toFixed(2)}` : '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <TimeEntryActions 
                      entry={entry} 
                      userId={session.user.id}
                    />
                  </div>
                );
              })}
              
              {timeEntries.length > 10 && (
                <div className="text-center pt-4">
                  <Link href="/time-tracking/all">
                    <Button variant="outline">
                      View All Entries ({timeEntries.length})
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