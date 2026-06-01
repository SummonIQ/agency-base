import { auth } from '@/lib/auth/server';
import { getClientStats } from '@/lib/clients';
import { getLeadStats } from '@/lib/agency-leads';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GlassyContainer } from '@/components/ui/glassy-edge';
import { 
  Building2, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Users,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
  Briefcase
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [clientStats, leadStats] = await Promise.all([
    getClientStats(session.user.id),
    getLeadStats(session.user.id),
  ]);

  // Calculate MRR (Monthly Recurring Revenue) - placeholder calculation
  const mrr = Math.round(clientStats.totalRevenue / 12);
  
  // Calculate growth rate - placeholder
  const growthRate = 15.3;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Agency Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your agency overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/agency-leads/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Lead
            </Button>
          </Link>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Monthly Recurring</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">${mrr.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{growthRate}%</span> from last month
              </p>
            </div>
          </div>
        </GlassyContainer>
        
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Active Clients</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{clientStats.activeClients}</div>
              <p className="text-xs text-muted-foreground">
                {clientStats.totalClients} total clients
              </p>
            </div>
          </div>
        </GlassyContainer>
        
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Pipeline Value</div>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                ${leadStats.totalPipeline.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {leadStats.qualifiedLeads} qualified leads
              </p>
            </div>
          </div>
        </GlassyContainer>
        
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Win Rate</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{leadStats.conversionRate.toFixed(1)}%</div>
              <Progress value={leadStats.conversionRate} className="h-2" />
            </div>
          </div>
        </GlassyContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassyContainer className="cursor-pointer hover:scale-[1.01] transition-all duration-200">
          <Link href="/clients" className="block p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="h-5 w-5" />
                  Clients
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-sm text-muted-foreground">Manage your client relationships</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{clientStats.totalClients}</p>
                  <p className="text-sm text-muted-foreground">Total clients</p>
                </div>
                <Badge variant="secondary">{clientStats.activeClients} active</Badge>
              </div>
            </div>
          </Link>
        </GlassyContainer>

        <GlassyContainer className="cursor-pointer hover:scale-[1.01] transition-all duration-200">
          <Link href="/projects" className="block p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <FolderOpen className="h-5 w-5" />
                  Projects
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-sm text-muted-foreground">Track active projects</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{clientStats.activeProjects}</p>
                  <p className="text-sm text-muted-foreground">Active projects</p>
                </div>
                <Badge variant="secondary">View all</Badge>
              </div>
            </div>
          </Link>
        </GlassyContainer>

        <GlassyContainer className="cursor-pointer hover:scale-[1.01] transition-all duration-200">
          <Link href="/agency-leads" className="block p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Target className="h-5 w-5" />
                  Pipeline
                </div>
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-sm text-muted-foreground">Opportunities in pipeline</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{leadStats.totalLeads}</p>
                  <p className="text-sm text-muted-foreground">Total leads</p>
                </div>
                <Badge variant="secondary">{leadStats.qualifiedLeads} qualified</Badge>
              </div>
            </div>
          </Link>
        </GlassyContainer>
      </div>

      {/* Recent Activity & Tasks */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest updates from your agency</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New client onboarded</p>
                  <p className="text-xs text-muted-foreground">Acme Corp - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Project milestone completed</p>
                  <p className="text-xs text-muted-foreground">Website Redesign - 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Proposal sent</p>
                  <p className="text-xs text-muted-foreground">TechStart Inc - Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </GlassyContainer>

        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
              <p className="text-sm text-muted-foreground">What needs your attention</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Follow up with lead</p>
                  <p className="text-xs text-muted-foreground">GlobalTech - Due today</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Client meeting</p>
                  <p className="text-xs text-muted-foreground">Acme Corp - Tomorrow 2 PM</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Send invoice</p>
                  <p className="text-xs text-muted-foreground">Project XYZ - Due in 3 days</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </div>
        </GlassyContainer>
      </div>

      {/* Revenue Chart Placeholder */}
      <GlassyContainer edges={[]}>
        <div className="p-6">
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue for the last 6 months</p>
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Revenue chart will be displayed here</p>
              <p className="text-sm mt-2">Connect your data to see trends</p>
            </div>
          </div>
        </div>
      </GlassyContainer>
    </div>
  );
}
