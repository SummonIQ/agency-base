import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Target,
  CheckCircle,
  PlayCircle,
  Clock,
  Star,
  Lightbulb,
  Network,
  DollarSign,
  Mail
} from 'lucide-react';

export default async function RecruitingTrainingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const trainingModules = [
    {
      id: 1,
      title: "Leverage Your Development Network",
      description: "Turn your existing connections into recruiting gold",
      duration: "45 min",
      completed: true,
      category: "Getting Started"
    },
    {
      id: 2,
      title: "Choose Your Recruiting Niche",
      description: "Focus on what you know best for maximum success",
      duration: "30 min",
      completed: true,
      category: "Getting Started"
    },
    {
      id: 3,
      title: "Fee Structures That Work",
      description: "Price your services competitively and profitably",
      duration: "25 min",
      completed: true,
      category: "Getting Started"
    },
    {
      id: 4,
      title: "Warm Outreach to Clients",
      description: "Convert your network into paying clients",
      duration: "40 min",
      completed: false,
      category: "Client Acquisition"
    },
    {
      id: 5,
      title: "Cold Outreach That Converts",
      description: "Master the art of cold email for recruiting",
      duration: "35 min",
      completed: false,
      category: "Client Acquisition"
    },
    {
      id: 6,
      title: "Candidate Sourcing Strategies",
      description: "Find top talent on LinkedIn, GitHub, and beyond",
      duration: "50 min",
      completed: false,
      category: "Candidate Sourcing"
    },
    {
      id: 7,
      title: "Technical Screening Mastery",
      description: "Assess candidates like a senior engineer",
      duration: "45 min",
      completed: false,
      category: "Best Practices"
    },
    {
      id: 8,
      title: "Building Your Candidate Pipeline",
      description: "Create a sustainable talent pipeline",
      duration: "40 min",
      completed: false,
      category: "Best Practices"
    }
  ];

  const quickStartGuide = [
    {
      step: 1,
      title: "Map Your Network",
      description: "List 50+ contacts who could be candidates or referral sources",
      action: "Create Network Spreadsheet"
    },
    {
      step: 2,
      title: "Choose Your Focus",
      description: "Pick 2-3 specific roles to specialize in initially",
      action: "Define Your Niche"
    },
    {
      step: 3,
      title: "Set Your Rates",
      description: "Start with 18-20% contingency, move to retained later",
      action: "Create Fee Structure"
    },
    {
      step: 4,
      title: "Reach Out Warm",
      description: "Contact 5 people in your network about recruiting services",
      action: "Send First Emails"
    },
    {
      step: 5,
      title: "Find Candidates",
      description: "Source 20 potential candidates for your target roles",
      action: "Build Candidate List"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiting Business Training</h1>
          <p className="text-muted-foreground">Master technical recruiting from development background</p>
        </div>
        <Button>
          <PlayCircle className="mr-2 h-4 w-4" />
          Continue Learning
        </Button>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/8</div>
            <p className="text-xs text-muted-foreground">37.5% complete</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.7h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Out of 15</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Up</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">Client Outreach</div>
            <p className="text-xs text-muted-foreground">Warm networking strategies</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Start Guide */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Your first week action plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickStartGuide.map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      <Button size="sm" variant="outline" className="mt-2 text-xs">
                        {item.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Modules */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Training Modules
              </CardTitle>
              <CardDescription>
                Comprehensive recruiting business curriculum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingModules.map((module) => (
                  <div key={module.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex-shrink-0">
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{module.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {module.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{module.duration}</span>
                      </div>
                    </div>
                    <Button size="sm" variant={module.completed ? "outline" : "default"}>
                      {module.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Resources */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Mapping
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Turn your development network into recruiting opportunities
            </p>
            <Button size="sm" className="w-full">Access Network Tool</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Proven templates for client and candidate outreach
            </p>
            <Button size="sm" className="w-full">View Templates</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Fee Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Calculate fees and create pricing proposals
            </p>
            <Button size="sm" className="w-full">Open Calculator</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
