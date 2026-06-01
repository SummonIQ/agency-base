import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Plus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Briefcase,
  Building,
  DollarSign,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical
} from 'lucide-react';

export default async function ApplicationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Mock data for applications
  const applications = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.johnson@example.com',
      position: 'Senior Full Stack Developer',
      company: 'TechCorp',
      department: 'Engineering',
      status: 'screening',
      stage: 'Technical Review',
      appliedDate: new Date('2024-06-15'),
      lastActivity: new Date('2024-06-20'),
      salary: '$120k - $150k',
      location: 'San Francisco, CA',
      type: 'Full-time',
      score: 85,
    },
    {
      id: '2',
      candidateName: 'Michael Chen',
      candidateEmail: 'michael.chen@example.com',
      position: 'Product Manager',
      company: 'StartupXYZ',
      department: 'Product',
      status: 'interview',
      stage: 'Final Round',
      appliedDate: new Date('2024-06-10'),
      lastActivity: new Date('2024-06-21'),
      salary: '$130k - $160k',
      location: 'New York, NY',
      type: 'Full-time',
      score: 92,
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      candidateEmail: 'emily.davis@example.com',
      position: 'UX Designer',
      company: 'DesignHub',
      department: 'Design',
      status: 'new',
      stage: 'Application Review',
      appliedDate: new Date('2024-06-20'),
      lastActivity: new Date('2024-06-20'),
      salary: '$90k - $110k',
      location: 'Remote',
      type: 'Contract',
      score: 78,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'screening':
        return 'bg-purple-100 text-purple-800';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Track and manage job applications</p>
        </div>
        <Link href="/recruiting/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'new').length}
            </div>
            <p className="text-xs text-blue-600">Needs review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screening</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'screening').length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.status === 'interview').length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-green-600">Good fit</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
          <CardDescription>Overview of applications in each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Applied</div>
              <Progress value={100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Screening</div>
              <Progress value={66} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Interview</div>
              <Progress value={33} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Offer</div>
              <Progress value={0} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Hired</div>
              <Progress value={0} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
              <Progress value={0} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{application.position}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{application.candidateName}</span>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <Badge variant="outline">{application.stage}</Badge>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(application.score)}`}>
                      {application.score}
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      {application.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                      {application.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {application.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Applied {application.appliedDate.toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{application.type}</Badge>
                    <Badge variant="secondary">{application.location}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Last activity: {application.lastActivity.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Notes
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start tracking job applications to manage your recruitment pipeline
            </p>
            <Link href="/recruiting/applications/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}