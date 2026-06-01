import { auth } from '@/lib/auth/server';
import { getAgencyLeads, getLeadStats } from '@/lib/agency-leads';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Users,
  Mail,
  Phone,
  Calendar,
  Building
} from 'lucide-react';

export default async function AgencyLeadsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [leads, stats] = await Promise.all([
    getAgencyLeads(session.user.id),
    getLeadStats(session.user.id),
  ]);

  const statusColors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-purple-100 text-purple-800',
    QUALIFIED: 'bg-indigo-100 text-indigo-800',
    PROPOSAL_SENT: 'bg-yellow-100 text-yellow-800',
    NEGOTIATING: 'bg-orange-100 text-orange-800',
    WON: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
    NURTURING: 'bg-gray-100 text-gray-800',
  };

  const sourceIcons = {
    WEBSITE: '🌐',
    REFERRAL: '🤝',
    COLD_OUTREACH: '📧',
    INBOUND: '📥',
    SOCIAL_MEDIA: '📱',
    PLATFORM_UPWORK: '💼',
    PLATFORM_TOPTAL: '🏆',
    PLATFORM_CONTRA: '🎨',
    PLATFORM_FIVERR: '🎯',
    NETWORKING_EVENT: '🤝',
    OTHER: '📌',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads & Opportunities</h1>
          <p className="text-muted-foreground">Track and convert potential clients</p>
        </div>
        <Link href="/agency-leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalPipeline.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {leads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No leads yet</h2>
              <p className="text-muted-foreground mb-4">
                Start building your pipeline
              </p>
              <Link href="/agency-leads/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Lead
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">{sourceIcons[lead.source]}</span>
                      <Link 
                        href={`/agency-leads/${lead.id}`}
                        className="hover:underline"
                      >
                        {lead.title}
                      </Link>
                      <Badge className={statusColors[lead.status]}>
                        {lead.status.replace(/_/g, ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {lead.companyName && (
                        <span className="flex items-center gap-1 mr-4">
                          <Building className="h-3 w-3" />
                          {lead.companyName}
                        </span>
                      )}
                      {lead.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {lead.estimatedValue && (
                      <div className="flex items-center text-green-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">
                          {lead.estimatedValue.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {lead.probability && (
                      <div className="w-24">
                        <div className="text-xs text-muted-foreground mb-1">
                          {lead.probability}% likely
                        </div>
                        <Progress value={lead.probability} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {lead.contactName && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {lead.contactName}
                    </div>
                  )}
                  {lead.contactEmail && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.contactEmail}
                    </div>
                  )}
                  {lead.contactPhone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.contactPhone}
                    </div>
                  )}
                  {lead.estimatedStartDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(lead.estimatedStartDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex gap-2">
                    {lead._count.proposals > 0 && (
                      <Badge variant="outline">
                        {lead._count.proposals} proposal{lead._count.proposals !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    {lead._count.communications > 0 && (
                      <Badge variant="outline">
                        {lead._count.communications} communication{lead._count.communications !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  {lead.client && (
                    <Link href={`/clients/${lead.client.id}`}>
                      <Badge variant="secondary">
                        Client: {lead.client.name}
                      </Badge>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}