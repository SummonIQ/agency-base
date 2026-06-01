import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  User,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Video,
  FileText,
  Award,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';

export default async function CandidateAssessmentPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const candidate = {
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    currentRole: "Senior Full Stack Developer",
    currentCompany: "TechStart Inc",
    experience: "6 years",
    expectedSalary: "$140,000 - $160,000",
    availability: "2 weeks notice",
    linkedinUrl: "linkedin.com/in/sarahchen",
    githubUrl: "github.com/sarahchen"
  };

  const assessmentSections = [
    {
      title: "Technical Skills",
      weight: 40,
      score: 85,
      items: [
        { skill: "React/JavaScript", rating: 5, required: true },
        { skill: "Node.js/Express", rating: 4, required: true },
        { skill: "TypeScript", rating: 4, required: true },
        { skill: "PostgreSQL", rating: 4, required: false },
        { skill: "AWS/Cloud", rating: 3, required: false },
        { skill: "GraphQL", rating: 3, required: false }
      ]
    },
    {
      title: "Experience Match",
      weight: 25,
      score: 90,
      items: [
        { aspect: "Years of Experience", rating: 5, note: "6 years matches requirement" },
        { aspect: "Industry Experience", rating: 4, note: "SaaS/B2B experience" },
        { aspect: "Team Size", rating: 5, note: "Led team of 4 developers" },
        { aspect: "Similar Role", rating: 4, note: "Full-stack lead experience" }
      ]
    },
    {
      title: "Cultural Fit",
      weight: 20,
      score: 80,
      items: [
        { aspect: "Communication", rating: 4, note: "Clear, articulate responses" },
        { aspect: "Problem Solving", rating: 4, note: "Structured approach" },
        { aspect: "Collaboration", rating: 4, note: "Strong team player" },
        { aspect: "Growth Mindset", rating: 4, note: "Eager to learn new tech" }
      ]
    },
    {
      title: "Motivation & Interest",
      weight: 15,
      score: 75,
      items: [
        { aspect: "Role Interest", rating: 4, note: "Excited about challenges" },
        { aspect: "Company Interest", rating: 3, note: "Researched company well" },
        { aspect: "Career Goals", rating: 4, note: "Aligned with growth path" },
        { aspect: "Compensation", rating: 4, note: "Within budget range" }
      ]
    }
  ];

  const overallScore = assessmentSections.reduce((acc, section) => 
    acc + (section.score * section.weight / 100), 0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Candidate Assessment</h1>
          <p className="text-muted-foreground">Comprehensive evaluation for Senior Full Stack Developer role</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit Assessment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Assessment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score */}
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Overall Assessment Score
                </span>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(overallScore)}%
                </div>
              </CardTitle>
              <CardDescription>
                Weighted average across all assessment criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={overallScore} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span>Poor Fit</span>
                  <span>Excellent Fit</span>
                </div>
                <div className="flex items-center gap-2">
                  {overallScore >= 80 ? (
                    <>
                      <Badge className="bg-green-500">Strong Candidate</Badge>
                      <span className="text-sm text-green-600">Recommend for client interview</span>
                    </>
                  ) : overallScore >= 70 ? (
                    <>
                      <Badge className="bg-yellow-500">Good Candidate</Badge>
                      <span className="text-sm text-yellow-600">Consider for interview</span>
                    </>
                  ) : (
                    <>
                      <Badge variant="destructive">Weak Candidate</Badge>
                      <span className="text-sm text-red-600">Not recommended</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Sections */}
          {assessmentSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      {section.weight}%
                    </div>
                    {section.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">{section.score}%</span>
                    <Progress value={section.score} className="w-20 h-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.skill || item.aspect}
                          </span>
                          {item.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {item.note && (
                          <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= item.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium w-8">{item.rating}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Interview Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Interview Notes & Observations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="technical-notes">Technical Assessment Notes</Label>
                <Textarea 
                  id="technical-notes"
                  placeholder="Technical discussion highlights, code review feedback, problem-solving approach..."
                  rows={4}
                  defaultValue="Strong technical foundation with React and Node.js. Demonstrated good understanding of system design principles. Code samples show clean, well-documented work. Handled technical questions confidently."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="behavioral-notes">Behavioral Interview Notes</Label>
                <Textarea 
                  id="behavioral-notes"
                  placeholder="Communication style, leadership examples, team collaboration..."
                  rows={4}
                  defaultValue="Excellent communication skills. Provided specific examples of leading technical initiatives. Shows strong problem-solving methodology. Collaborative approach to team challenges."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="concerns">Concerns or Red Flags</Label>
                <Textarea 
                  id="concerns"
                  placeholder="Any concerns about fit, skills, or other factors..."
                  rows={3}
                  defaultValue="Minor concern about AWS experience level, but shows willingness to learn. No major red flags identified."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea 
                  id="strengths"
                  placeholder="Standout qualities and advantages..."
                  rows={3}
                  defaultValue="Strong technical skills, proven leadership experience, excellent communication, growth mindset, cultural fit with team values."
                />
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Final Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button className="flex-1">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Recommend to Client
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Clock className="mr-2 h-4 w-4" />
                    Hold for Review
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Do Not Recommend
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendation-notes">Recommendation Summary</Label>
                  <Textarea 
                    id="recommendation-notes"
                    placeholder="Brief summary for client presentation..."
                    rows={3}
                    defaultValue="Strong candidate with excellent technical skills and leadership experience. Meets all core requirements and shows strong cultural fit. Recommend proceeding with client interview."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-muted-foreground">{candidate.currentRole}</p>
                <p className="text-sm text-muted-foreground">{candidate.currentCompany}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-medium">{candidate.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{candidate.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Salary:</span>
                  <span className="font-medium">{candidate.expectedSalary}</span>
                </div>
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span className="font-medium">{candidate.availability}</span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="mr-1 h-3 w-3" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Video className="mr-1 h-3 w-3" />
                  Video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Resume Review</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Phone Screening</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Technical Interview</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Final Assessment</span>
                </div>
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-gray-300" />
                  <span className="text-sm text-muted-foreground">Client Interview</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View Resume
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Interview History
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                Reference Check
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Background Check
              </Button>
            </CardContent>
          </Card>

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle>Previous Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Phone Screen</span>
                  <Badge variant="secondary">85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Technical Round 1</span>
                  <Badge variant="secondary">88%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Technical Round 2</span>
                  <Badge variant="secondary">82%</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span>Average Score</span>
                  <Badge>85%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
