import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  Target,
  TrendingUp,
  DollarSign,
  Clock,
  Plus,
  Search,
  BookOpen,
  Network,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const mockMetrics = {
  totalClients: 8,
  activeJobs: 12,
  candidatesInPipeline: 47,
  placementsMTD: 3,
  placementsYTD: 18,
  revenueMTD: 45000,
  revenueYTD: 285000,
  averageTimeToFill: 28,
  averageFee: 15833,
  submissionToHireRatio: 0.18,
  candidateResponseRate: 0.23,
  clientSatisfactionScore: 4.6
};

const mockActiveJobs = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    client: 'TechFlow Solutions',
    location: 'Austin, TX',
    remote: 'Hybrid',
    salary: '$120k - $150k',
    fee: 27000,
    candidatesSubmitted: 5,
    status: 'active',
    daysOpen: 12,
    priority: 'high'
  },
  {
    id: '2',
    title: 'DevOps Engineer',
    client: 'CloudSync Inc',
    location: 'Remote',
    remote: 'Full',
    salary: '$130k - $160k',
    fee: 29000,
    candidatesSubmitted: 3,
    status: 'active',
    daysOpen: 8,
    priority: 'urgent'
  },
  {
    id: '3',
    title: 'Frontend Developer',
    client: 'DataViz Pro',
    location: 'Seattle, WA',
    remote: 'Hybrid',
    salary: '$100k - $125k',
    fee: 22500,
    candidatesSubmitted: 7,
    status: 'interviewing',
    daysOpen: 21,
    priority: 'medium'
  }
];

const mockTopCandidates = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Full Stack Developer',
    company: 'Meta',
    location: 'San Francisco, CA',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    experience: 6,
    status: 'available',
    score: 9.2,
    lastContact: '2 days ago'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'DevOps Engineer',
    company: 'Netflix',
    location: 'Los Angeles, CA',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Python'],
    experience: 8,
    status: 'interviewing',
    score: 8.8,
    lastContact: '1 week ago'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    title: 'Frontend Developer',
    company: 'Airbnb',
    location: 'Austin, TX',
    skills: ['React', 'Vue.js', 'CSS', 'JavaScript'],
    experience: 4,
    status: 'interested',
    score: 8.5,
    lastContact: '3 days ago'
  }
];

export default async function RecruitingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    interviewing: 'bg-purple-100 text-purple-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    filled: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const candidateStatusColors = {
    available: 'bg-green-100 text-green-800',
    interviewing: 'bg-purple-100 text-purple-800',
    interested: 'bg-blue-100 text-blue-800',
    'not-interested': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiting Business</h1>
          <p className="text-muted-foreground">Manage clients, candidates, and placements</p>
        </div>
        <div className="flex gap-2">
          <Link href="/recruiting/candidates/search">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Find Candidates
            </Button>
          </Link>
          <Link href="/recruiting/training">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Training
            </Button>
          </Link>
          <Link href="/recruiting/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.activeJobs}</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.candidatesInPipeline}</div>
            <p className="text-xs text-muted-foreground">in pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placements MTD</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.placementsMTD}</div>
            <p className="text-xs text-muted-foreground">{mockMetrics.placementsYTD} YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(mockMetrics.revenueMTD / 1000).toFixed(0)}k</div>
            <p className="text-xs text-muted-foreground">${(mockMetrics.revenueYTD / 1000).toFixed(0)}k YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Fill</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.averageTimeToFill}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(mockMetrics.candidateResponseRate * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">candidate outreach</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Top Candidates</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Job Requisitions</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="grid gap-4">
            {mockActiveJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {job.title}
                        <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                          {job.status}
                        </Badge>
                        <Badge className={priorityColors[job.priority as keyof typeof priorityColors]}>
                          {job.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {job.client} • {job.location} • {job.remote} • {job.salary}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        ${job.fee.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">fee</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.candidatesSubmitted} submitted
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {job.daysOpen} days open
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm">Find Candidates</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Top Candidates</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-3 w-3" />
                Search More
              </Button>
              <Button variant="outline" size="sm">Import</Button>
            </div>
          </div>
          <div className="grid gap-4">
            {mockTopCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {candidate.name}
                        <Badge className={candidateStatusColors[candidate.status as keyof typeof candidateStatusColors]}>
                          {candidate.status}
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {candidate.score}/10
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {candidate.title} at {candidate.company} • {candidate.experience} years exp
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {candidate.location}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Last contact: {candidate.lastContact}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Profile</Button>
                        <Button size="sm">Match to Job</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recruiting Clients</h2>
            <Button variant="outline" size="sm">Add Client</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: 'TechFlow Solutions', jobs: 3, placements: 2, revenue: 54000, status: 'active' },
              { name: 'CloudSync Inc', jobs: 2, placements: 1, revenue: 29000, status: 'active' },
              { name: 'DataViz Pro', jobs: 1, placements: 3, revenue: 67500, status: 'active' },
              { name: 'StartupX', jobs: 0, placements: 1, revenue: 18000, status: 'inactive' }
            ].map((client, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {client.name}
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{client.jobs}</div>
                      <div className="text-xs text-muted-foreground">Active Jobs</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{client.placements}</div>
                      <div className="text-xs text-muted-foreground">Placements</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">${(client.revenue / 1000).toFixed(0)}k</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Network</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Network className="mr-2 h-3 w-3" />
                Map Network
              </Button>
              <Button variant="outline" size="sm">Add Contact</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strong Connections</CardTitle>
                <CardDescription>Close contacts who can provide referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23</div>
                <p className="text-sm text-muted-foreground">Former colleagues, clients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medium Connections</CardTitle>
                <CardDescription>Professional acquaintances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">67</div>
                <p className="text-sm text-muted-foreground">LinkedIn connections, meetup contacts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Sources</CardTitle>
                <CardDescription>Contacts who've provided referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Active referral partners</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
