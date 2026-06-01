'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  Target, 
  MessageSquare, 
  UserPlus, 
  TrendingUp,
  Filter,
  Download,
  Play,
  Pause,
  Clock,
  CheckCircle,
  Star,
  Briefcase,
  MapPin,
  Building,
  Award,
  Brain,
  Code
} from 'lucide-react';

export interface TechnicalCandidate {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  company: string;
  experience: string;
  skills: string[];
  industry: string;
  seniority: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Principal' | 'Director' | 'VP' | 'C-Level';
  profileUrl: string;
  connectionDegree: string;
  premium: boolean;
  lastActive: string;
  recruitable: boolean;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  techStack: string[];
  yearsExperience: number;
  openToWork: boolean;
  score: number;
  matchReasons: string[];
}

export interface RecruitingFilters {
  role?: string;
  skills?: string[];
  location?: string;
  experience?: string;
  seniority?: string[];
  company?: string;
  industry?: string;
  salaryMin?: number;
  salaryMax?: number;
  openToWork?: boolean;
  techStack?: string[];
}

interface LinkedInRecruitingDashboardProps {
  onSearch: (filters: RecruitingFilters) => void;
  onConnect: (candidateId: string, message?: string) => void;
  onMessage: (candidateId: string, message: string) => void;
  onAddToSequence: (candidateIds: string[], sequenceId: string) => void;
  candidates: TechnicalCandidate[];
  loading?: boolean;
}

const TECHNICAL_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Go',
  'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'C#', '.NET', 'Angular', 'Vue.js',
  'Next.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD',
  'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Microservices'
];

const SENIORITY_LEVELS = [
  'Entry', 'Mid', 'Senior', 'Lead', 'Principal', 'Director', 'VP', 'C-Level'
];

const TECH_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Engineer', 'Machine Learning Engineer', 'Product Manager',
  'Engineering Manager', 'Tech Lead', 'Solutions Architect', 'Data Scientist',
  'QA Engineer', 'Mobile Developer', 'Security Engineer', 'Site Reliability Engineer'
];

export function LinkedInRecruitingDashboard({
  onSearch,
  onConnect,
  onMessage,
  onAddToSequence,
  candidates,
  loading = false
}: LinkedInRecruitingDashboardProps) {
  const [filters, setFilters] = useState<RecruitingFilters>({});
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'candidates' | 'sequences' | 'analytics'>('search');

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSelectCandidate = (candidateId: string, selected: boolean) => {
    if (selected) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCandidates(candidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'C-Level': case 'VP': return 'bg-purple-100 text-purple-800';
      case 'Director': case 'Principal': return 'bg-blue-100 text-blue-800';
      case 'Lead': case 'Senior': return 'bg-green-100 text-green-800';
      case 'Mid': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Recruiting</h1>
          <p className="text-gray-600">Systematic technical candidate sourcing and outreach</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onSearch({})}>
            <Search className="h-4 w-4 mr-2" />
            Quick Search
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Connect Selected ({selectedCandidates.length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Candidates</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {candidates.length.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">High Match</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {candidates.filter(c => c.score >= 90).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Open to Work</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {candidates.filter(c => c.openToWork).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Senior+</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {candidates.filter(c => ['Senior', 'Lead', 'Principal', 'Director', 'VP', 'C-Level'].includes(c.seniority)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="h-4 w-4 mr-2" />
            Candidates ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <MessageSquare className="h-4 w-4 mr-2" />
            Outreach Sequences
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recruiting Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-6 w-6" />
                Technical Candidate Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Role/Position</Label>
                  <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECH_ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    value={filters.location || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="San Francisco, New York, Remote"
                  />
                </div>

                <div>
                  <Label>Years Experience</Label>
                  <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-8">5-8 years</SelectItem>
                      <SelectItem value="8-12">8-12 years</SelectItem>
                      <SelectItem value="12+">12+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Technical Skills (select multiple)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {TECHNICAL_SKILLS.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={filters.skills?.includes(skill) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              skills: [...(prev.skills || []), skill]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              skills: prev.skills?.filter(s => s !== skill) || []
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={skill} className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Seniority Levels</Label>
                <div className="flex flex-wrap gap-2">
                  {SENIORITY_LEVELS.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={filters.seniority?.includes(level) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              seniority: [...(prev.seniority || []), level]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              seniority: prev.seniority?.filter(s => s !== level) || []
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={level} className="text-sm">{level}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <Input
                    value={filters.company || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Google, Meta, startups"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="openToWork"
                    checked={filters.openToWork || false}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, openToWork: checked as boolean }))}
                  />
                  <Label htmlFor="openToWork">Open to work only</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Searching...' : 'Search Candidates'}
                </Button>
                <Button variant="outline" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          {candidates.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Candidate Results</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label>Select All</Label>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export ({candidates.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedCandidates.includes(candidate.id)}
                            onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {candidate.firstName} {candidate.lastName}
                              </h3>
                              <Badge className={getSeniorityColor(candidate.seniority)}>
                                {candidate.seniority}
                              </Badge>
                              {candidate.openToWork && (
                                <Badge className="bg-green-100 text-green-800">
                                  Open to Work
                                </Badge>
                              )}
                              {candidate.premium && (
                                <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-2">{candidate.headline}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {candidate.company}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {candidate.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {candidate.yearsExperience} years
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {candidate.techStack.slice(0, 6).map(tech => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {candidate.techStack.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{candidate.techStack.length - 6} more
                                </Badge>
                              )}
                            </div>

                            <div className="text-sm text-gray-600">
                              <strong>Match Reasons:</strong> {candidate.matchReasons.join(', ')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(candidate.score)}`}>
                              {candidate.score}
                            </div>
                            <div className="text-xs text-gray-500">Match Score</div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => onConnect(candidate.id)}>
                              <UserPlus className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onMessage(candidate.id, '')}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {candidates.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Candidates Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search filters or search criteria
                </p>
                <Button onClick={() => setActiveTab('search')}>
                  Refine Search
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recruiting Outreach Sequences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Recruiting sequence management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recruiting Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
