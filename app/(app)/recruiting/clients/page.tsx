import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Building2,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Target,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Mock data for recruiting clients
const mockRecruitingClients = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    type: 'Technology',
    status: 'active',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@techflow.com',
    phone: '+1 (555) 123-4567',
    location: 'Austin, TX',
    industry: 'Software Development',
    size: '50-200 employees',
    activeJobs: 3,
    totalJobs: 8,
    placements: 5,
    revenue: 125000,
    averageFee: 25000,
    feeStructure: 'Contingency - 20%',
    contractType: 'MSA',
    lastContact: '2024-01-15',
    nextFollowUp: '2024-01-30',
    priority: 'high',
    notes: 'Excellent client, fast decision making, prefers senior level candidates'
  },
  {
    id: '2',
    name: 'CloudSync Inc',
    type: 'Technology',
    status: 'active',
    contactPerson: 'Michael Chen',
    email: 'michael@cloudsync.com',
    phone: '+1 (555) 987-6543',
    location: 'Remote',
    industry: 'Cloud Infrastructure',
    size: '200-500 employees',
    activeJobs: 2,
    totalJobs: 5,
    placements: 3,
    revenue: 87000,
    averageFee: 29000,
    feeStructure: 'Retained - $15k upfront',
    contractType: 'SOW',
    lastContact: '2024-01-12',
    nextFollowUp: '2024-01-25',
    priority: 'medium',
    notes: 'Technical interviews are thorough, budget conscious but fair'
  },
  {
    id: '3',
    name: 'DataViz Pro',
    type: 'Analytics',
    status: 'prospect',
    contactPerson: 'Emily Rodriguez',
    email: 'emily@datavizpro.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    industry: 'Data Analytics',
    size: '20-50 employees',
    activeJobs: 0,
    totalJobs: 0,
    placements: 0,
    revenue: 0,
    averageFee: 0,
    feeStructure: 'TBD',
    contractType: 'None',
    lastContact: '2024-01-10',
    nextFollowUp: '2024-01-20',
    priority: 'high',
    notes: 'New prospect, interested in frontend and data visualization roles'
  }
];

export default async function RecruitingClientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    prospect: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    churned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiting Clients</h1>
          <p className="text-muted-foreground">Manage your recruiting client relationships and job requisitions</p>
        </div>
        <div className="flex gap-2">
          <Link href="/recruiting/clients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRecruitingClients.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockRecruitingClients.filter(c => c.status === 'prospect').length} prospects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRecruitingClients.reduce((sum, client) => sum + client.activeJobs, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockRecruitingClients.reduce((sum, client) => sum + client.totalJobs, 0)} total jobs
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
              ${(mockRecruitingClients.reduce((sum, client) => sum + client.revenue, 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              {mockRecruitingClients.reduce((sum, client) => sum + client.placements, 0)} placements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fee</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((mockRecruitingClients.reduce((sum, client) => sum + client.revenue, 0)) /
                Math.max(mockRecruitingClients.reduce((sum, client) => sum + client.placements, 0), 1) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">per placement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Clients</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="all">All Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-6">
            {mockRecruitingClients
              .filter(client => client.status === 'active')
              .map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {client.name}
                        <Badge className={statusColors[client.status as keyof typeof statusColors]}>
                          {client.status}
                        </Badge>
                        <Badge className={priorityColors[client.priority as keyof typeof priorityColors]}>
                          {client.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {client.industry} • {client.size} • {client.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        ${client.revenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">total revenue</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{client.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {/* Job Stats */}
                  <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{client.activeJobs}</div>
                      <div className="text-xs text-muted-foreground">Active Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{client.totalJobs}</div>
                      <div className="text-xs text-muted-foreground">Total Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{client.placements}</div>
                      <div className="text-xs text-muted-foreground">Placements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {client.placements > 0 ? Math.round((client.placements / client.totalJobs) * 100) : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  {/* Contract & Fee Info */}
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-muted-foreground">Fee Structure: </span>
                      <span className="font-medium">{client.feeStructure}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contract: </span>
                      <span className="font-medium">{client.contractType}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last contact: {new Date(client.lastContact).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Next: {new Date(client.nextFollowUp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                      <Button size="sm">
                        <Briefcase className="h-4 w-4 mr-1" />
                        New Job
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">{client.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <div className="grid gap-6">
            {mockRecruitingClients
              .filter(client => client.status === 'prospect')
              .map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow border-dashed">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {client.name}
                        <Badge className={statusColors[client.status as keyof typeof statusColors]}>
                          {client.status}
                        </Badge>
                        <Badge className={priorityColors[client.priority as keyof typeof priorityColors]}>
                          {client.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {client.industry} • {client.size} • {client.location}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        Prospect
                      </div>
                      <div className="text-sm text-muted-foreground">potential client</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{client.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last contact: {new Date(client.lastContact).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Next: {new Date(client.nextFollowUp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Convert to Client
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  {client.notes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">{client.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {mockRecruitingClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.contactPerson} • {client.industry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="font-bold">{client.activeJobs}</div>
                        <div className="text-xs text-muted-foreground">Active Jobs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{client.placements}</div>
                        <div className="text-xs text-muted-foreground">Placements</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">${(client.revenue / 1000).toFixed(0)}k</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <Badge className={statusColors[client.status as keyof typeof statusColors]}>
                        {client.status}
                      </Badge>
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