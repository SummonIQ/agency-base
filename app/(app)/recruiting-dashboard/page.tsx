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
  Users, 
  Briefcase, 
  Calendar, 
  Star,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Building2,
  Clock,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Mail,
  ExternalLink,
  FileText,
  Award,
  Target
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  experience?: string;
  education?: string;
  skills: string[];
  status: 'new' | 'active' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  rating?: number;
  resumeUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  _count?: {
    applications: number;
    interviews: number;
    notes: number;
  };
}

interface JobApplication {
  id: string;
  position: string;
  company: string;
  department?: string;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  stage?: string;
  salary?: string;
  location?: string;
  type?: string;
  score?: number;
  appliedDate: string;
  lastActivity: string;
  candidateId: string;
  candidate?: Candidate;
  _count?: {
    interviews: number;
    notes: number;
  };
}

interface TalentPool {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  qualityScore?: number;
  createdAt: string;
  _count?: {
    candidates: number;
  };
}

interface Interview {
  id: string;
  type: 'phone' | 'video' | 'onsite' | 'technical';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledAt: string;
  duration?: number;
  interviewer?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  candidate?: Candidate;
  application?: JobApplication;
}

interface RecruitingStats {
  totalCandidates: number;
  activeCandidates: number;
  totalApplications: number;
  activeApplications: number;
  totalTalentPools: number;
  upcomingInterviews: number;
  avgCandidateRating: number;
  applicationsByStatus: Record<string, number>;
  candidatesByStatus: Record<string, number>;
  interviewsByType: Record<string, number>;
}

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  screening: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  interviewing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  offered: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  offer: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  hired: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const INTERVIEW_ICONS = {
  phone: Phone,
  video: Video,
  onsite: Building2,
  technical: Award,
};

export default function RecruitingDashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [talentPools, setTalentPools] = useState<TalentPool[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<RecruitingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/recruiting?action=stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch candidates
      const candidateParams = new URLSearchParams();
      if (statusFilter !== 'all') candidateParams.append('status', statusFilter);
      
      const candidatesResponse = await fetch(`/api/recruiting?action=candidates&${candidateParams}`);
      const candidatesData = await candidatesResponse.json();
      if (candidatesData.success) {
        setCandidates(candidatesData.candidates);
      }

      // Fetch applications
      const applicationsResponse = await fetch('/api/recruiting?action=applications');
      const applicationsData = await applicationsResponse.json();
      if (applicationsData.success) {
        setApplications(applicationsData.applications);
      }

      // Fetch talent pools
      const talentPoolsResponse = await fetch('/api/recruiting?action=talent_pools');
      const talentPoolsData = await talentPoolsResponse.json();
      if (talentPoolsData.success) {
        setTalentPools(talentPoolsData.talentPools);
      }

      // Fetch upcoming interviews
      const interviewsResponse = await fetch('/api/recruiting?action=interviews&upcoming=true');
      const interviewsData = await interviewsResponse.json();
      if (interviewsData.success) {
        setInterviews(interviewsData.interviews);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.currentRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredApplications = applications.filter(application =>
    application.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.candidate?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{candidate.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
            {candidate.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{candidate.location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={STATUS_COLORS[candidate.status]}>
              {candidate.status}
            </Badge>
            {candidate.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{candidate.rating}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{candidate.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-lg">{candidate._count?.applications || 0}</div>
            <div className="text-muted-foreground">Applications</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{candidate._count?.interviews || 0}</div>
            <div className="text-muted-foreground">Interviews</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-lg">{candidate._count?.notes || 0}</div>
            <div className="text-muted-foreground">Notes</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {candidate.resumeUrl && (
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Resume
            </Button>
          )}
          {candidate.linkedInUrl && (
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              LinkedIn
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ApplicationCard = ({ application }: { application: JobApplication }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{application.position}</CardTitle>
            <p className="text-sm text-muted-foreground">{application.company}</p>
            {application.candidate && (
              <p className="text-xs text-muted-foreground mt-1">{application.candidate.name}</p>
            )}
          </div>
          <Badge className={STATUS_COLORS[application.status]}>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Applied:</span>
            <div>{new Date(application.appliedDate).toLocaleDateString()}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Last Activity:</span>
            <div>{new Date(application.lastActivity).toLocaleDateString()}</div>
          </div>
          {application.salary && (
            <div>
              <span className="text-muted-foreground">Salary:</span>
              <div>{application.salary}</div>
            </div>
          )}
          {application.score && (
            <div>
              <span className="text-muted-foreground">Score:</span>
              <div>{application.score}/100</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Notes ({application._count?.notes || 0})
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
          <h1 className="text-2xl font-bold text-foreground">Recruiting Dashboard</h1>
          <p className="text-muted-foreground">
            Manage candidates, applications, and talent pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Talent Pools
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="talent-pools">Talent Pools</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
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
                        <p className="text-sm text-muted-foreground">Total Candidates</p>
                        <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Applications</p>
                        <p className="text-2xl font-bold">{stats.activeApplications}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming Interviews</p>
                        <p className="text-2xl font-bold">{stats.upcomingInterviews}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Rating</p>
                        <p className="text-2xl font-bold">{stats.avgCandidateRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidates.slice(0, 5).map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
                          </div>
                          <Badge className={STATUS_COLORS[candidate.status]}>
                            {candidate.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Interviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {interviews.slice(0, 5).map((interview) => {
                        const InterviewIcon = INTERVIEW_ICONS[interview.type];
                        return (
                          <div key={interview.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <InterviewIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{interview.candidate?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(interview.scheduledAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {interview.type}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
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
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Candidates Grid */}
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
          ) : filteredCandidates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No candidates found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Add your first candidate to get started'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Candidate
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>

          <div className="space-y-4">
            {interviews.map((interview) => {
              const InterviewIcon = INTERVIEW_ICONS[interview.type];
              return (
                <Card key={interview.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <InterviewIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{interview.candidate?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {interview.application?.position} at {interview.application?.company}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(interview.scheduledAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(interview.scheduledAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Talent Pools Tab */}
        <TabsContent value="talent-pools" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Talent Pools</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talentPools.map((pool) => (
              <Card key={pool.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{pool.name}</CardTitle>
                  {pool.description && (
                    <p className="text-sm text-muted-foreground">{pool.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <Badge variant="secondary">{pool.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Candidates:</span>
                      <span className="font-medium">{pool._count?.candidates || 0}</span>
                    </div>
                    {pool.qualityScore && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Quality Score:</span>
                        <span className="font-medium">{pool.qualityScore.toFixed(1)}</span>
                      </div>
                    )}
                    {pool.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pool.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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
