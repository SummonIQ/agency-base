import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  Upload,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { CandidatesPageActions } from '@/components/recruiting/candidates-page-client';

export default async function CandidatesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Mock data for candidates
  const candidates = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      currentRole: 'Senior Software Engineer',
      experience: '8 years',
      education: 'BS Computer Science',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      status: 'active',
      rating: 5,
      appliedPositions: 2,
      addedAt: new Date('2024-06-10'),
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      currentRole: 'Product Manager',
      experience: '6 years',
      education: 'MBA',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      status: 'interviewing',
      rating: 4,
      appliedPositions: 1,
      addedAt: new Date('2024-06-15'),
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 246-8135',
      location: 'Austin, TX',
      currentRole: 'UX Designer',
      experience: '5 years',
      education: 'BA Design',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      status: 'new',
      rating: 4,
      appliedPositions: 1,
      addedAt: new Date('2024-06-20'),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'interviewing':
        return 'bg-purple-100 text-purple-800';
      case 'offered':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground">Manage your talent pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Resumes
          </Button>
          <CandidatesPageActions />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-xs text-muted-foreground">In pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviewing</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.status === 'interviewing').length}
            </div>
            <p className="text-xs text-muted-foreground">Active interviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-green-600">+50% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3</div>
            <p className="text-xs text-muted-foreground">Out of 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates by name, email, or skills..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {candidate.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {candidate.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {candidate.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        {candidate.experience}
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        {candidate.education}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < candidate.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                      {candidate.appliedPositions > 0 && (
                        <Badge variant="outline">
                          {candidate.appliedPositions} applications
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                  <Link href={`/recruiting/candidates/${candidate.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {candidates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Start building your talent pipeline by adding candidates
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Resumes
              </Button>
              <CandidatesPageActions />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}