import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Users,
  Mail,
  TrendingUp,
  Target,
  Zap,
  Building,
  BookOpen,
  Briefcase,
  BarChart3,
  ArrowRight,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Rocket,
  CheckCircle2,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default async function BusinessToolsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const leadGenerationFeatures = [
    {
      title: "Prospect Discovery",
      description: "AI-powered lead scoring and enrichment",
      icon: <Search className="h-5 w-5" />,
      href: "/lead-generation/search",
      features: ["Smart filtering", "Lead scoring", "Contact enrichment"]
    },
    {
      title: "Email Automation",
      description: "Templates with 22% conversion rate",
      icon: <Mail className="h-5 w-5" />,
      href: "/lead-generation",
      features: ["Proven templates", "Auto follow-ups", "Personalization"]
    },
    {
      title: "Analytics Dashboard",
      description: "Track campaigns and ROI",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/lead-generation",
      features: ["Pipeline tracking", "Response rates", "Performance metrics"]
    }
  ];

  const recruitingFeatures = [
    {
      title: "Training Program",
      description: "8-module recruiting curriculum",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/recruiting/training",
      features: ["Quick start guide", "Network mapping", "Fee structure"]
    },
    {
      title: "Candidate Sourcing",
      description: "Technical talent pipeline",
      icon: <Users className="h-5 w-5" />,
      href: "/recruiting/candidates/search",
      features: ["Boolean search", "GitHub sourcing", "AIDA framework"]
    },
    {
      title: "Client Acquisition",
      description: "Convert network to clients",
      icon: <Building className="h-5 w-5" />,
      href: "/recruiting",
      features: ["Warm outreach", "Value-first approach", "Templates"]
    },
    {
      title: "Pipeline Management",
      description: "Track jobs and submissions",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/recruiting",
      features: ["Job tracking", "Interview scheduling", "Placements"]
    }
  ];

  const businessStrategies = [
    {
      category: "Lead Generation Strategy",
      items: [
        "Start with 'Value-First Approach' template (22% conversion rate)",
        "Target companies using your tech stack (React, Node.js, TypeScript)",
        "Focus on 50-200 employee companies with recent funding",
        "Offer free development audits to prove value"
      ]
    },
    {
      category: "Recruiting Business Strategy", 
      items: [
        "Leverage your development network for warm introductions",
        "Position as 'Technical recruiting by developers, for developers'",
        "Start with 18-20% contingency fees, move to retained search",
        "Focus on full-stack, DevOps, and frontend developer roles"
      ]
    },
    {
      category: "Network Utilization",
      items: [
        "Map 50+ contacts (colleagues, clients, freelancers, meetup connections)",
        "Cross-sell recruiting services to development agency clients",
        "Offer $500-1000 referral bonuses for successful placements",
        "Host 'Tech Hiring Roundtable' meetups for networking"
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Business Growth Tools</h1>
          <p className="text-xl text-muted-foreground mt-2 max-w-3xl">
            Complete lead generation and recruiting business systems to scale your agency and diversify revenue streams
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/lead-generation/search">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6">
                <Search className="h-8 w-8 mb-3 text-blue-600" />
                <h3 className="font-semibold">Find Prospects</h3>
                <p className="text-sm text-muted-foreground mt-1">Search for clients</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recruiting/training">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6">
                <BookOpen className="h-8 w-8 mb-3 text-green-600" />
                <h3 className="font-semibold">Start Training</h3>
                <p className="text-sm text-muted-foreground mt-1">Recruiting curriculum</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lead-generation">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6">
                <MessageSquare className="h-8 w-8 mb-3 text-purple-600" />
                <h3 className="font-semibold">Email Templates</h3>
                <p className="text-sm text-muted-foreground mt-1">Outreach templates</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/recruiting">
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-6">
                <Users className="h-8 w-8 mb-3 text-orange-600" />
                <h3 className="font-semibold">Recruiting Hub</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage pipeline</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Lead Generation Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Lead Generation System</h2>
            <p className="text-muted-foreground">Automate prospect discovery and outreach for your development agency</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {leadGenerationFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={feature.href}>
                  <Button className="w-full">
                    Access Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recruiting Business Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-lg">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Recruiting Business System</h2>
            <p className="text-muted-foreground">Launch and scale your technical recruiting practice</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {recruitingFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg text-green-600 dark:text-green-400">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 mb-4">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={feature.href}>
                  <Button className="w-full" variant="outline">
                    Access Tool
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Strategies */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
            <Lightbulb className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Proven Business Strategies</h2>
            <p className="text-muted-foreground">Step-by-step guidance for success</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {businessStrategies.map((strategy, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{strategy.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {strategy.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {i + 1}
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Metrics & Performance */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Expected Performance</h2>
            <p className="text-muted-foreground">Realistic benchmarks and conversion rates</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Email Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">18-22%</div>
              <p className="text-xs text-muted-foreground">With proven templates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">LinkedIn Acceptance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">35%</div>
              <p className="text-xs text-muted-foreground">Connection requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recruiting Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">18-25%</div>
              <p className="text-xs text-muted-foreground">Of first year salary</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Time to Fill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">2-6 weeks</div>
              <p className="text-xs text-muted-foreground">Average placement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Network Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">70-80%</div>
              <p className="text-xs text-muted-foreground">Warm outreach</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cold Outreach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">10-15%</div>
              <p className="text-xs text-muted-foreground">Response rate</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            Ready to Get Started?
          </CardTitle>
          <CardDescription className="text-lg">
            Your first week action plan for business growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Lead Generation (Week 1)</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</div>
                  <span className="text-sm">Visit <Link href="/lead-generation/search" className="text-blue-600 hover:underline">/lead-generation/search</Link> to find prospects</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">2</div>
                  <span className="text-sm">Use "Value-First Approach" template (22% conversion)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">3</div>
                  <span className="text-sm">Target companies using your tech stack</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">4</div>
                  <span className="text-sm">Send 5 personalized emails daily</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Recruiting Business (Week 1)</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">1</div>
                  <span className="text-sm">Start <Link href="/recruiting/training" className="text-green-600 hover:underline">training program</Link> with network mapping</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">2</div>
                  <span className="text-sm">List 50+ network contacts (colleagues, clients)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">3</div>
                  <span className="text-sm">Send warm outreach to 5 former colleagues</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">4</div>
                  <span className="text-sm">Set up LinkedIn Recruiter Lite ($140/month)</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <Link href="/lead-generation">
              <Button size="lg">
                <Target className="mr-2 h-4 w-4" />
                Start Lead Generation
              </Button>
            </Link>
            <Link href="/recruiting/training">
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Begin Recruiting Training
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
