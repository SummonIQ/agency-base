import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Zap,
  Building,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  FileText,
  Award,
  Lightbulb,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default async function BusinessDocumentationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const completedFeatures = [
    {
      title: "Action Plan Dashboard",
      path: "/action-plan",
      description: "Complete execution roadmap with timeline and milestones",
      status: "completed"
    },
    {
      title: "Business Tools Hub",
      path: "/business-tools",
      description: "Centralized toolkit for lead generation and recruiting",
      status: "completed"
    },
    {
      title: "Lead Generation Suite",
      path: "/lead-generation",
      description: "Prospect search, outreach templates, and automation",
      status: "completed"
    },
    {
      title: "Agency Lead Management",
      path: "/agency-leads",
      description: "CRM for tracking prospects and pipeline",
      status: "completed"
    },
    {
      title: "Recruiting Platform",
      path: "/recruiting",
      description: "Complete recruiting business with training and tools",
      status: "completed"
    },
    {
      title: "Network Mapping",
      path: "/recruiting/network-mapping",
      description: "Professional network visualization and leverage",
      status: "completed"
    },
    {
      title: "Job Requisition System",
      path: "/recruiting/jobs/new",
      description: "Client job posting and requirement gathering",
      status: "completed"
    },
    {
      title: "Candidate Assessment",
      path: "/recruiting/candidates/assess",
      description: "Comprehensive candidate evaluation system",
      status: "completed"
    },
    {
      title: "Fee Calculator",
      path: "/recruiting/fee-calculator",
      description: "Competitive fee calculation and proposal generation",
      status: "completed"
    }
  ];

  const immediateActions = [
    {
      action: "Map Your Network",
      description: "Add 50+ professional contacts to network mapping tool",
      timeEstimate: "3 hours",
      priority: "high",
      expectedOutcome: "Foundation for recruiting outreach"
    },
    {
      action: "Send 5 Warm Recruiting Emails",
      description: "Contact former colleagues about recruiting services",
      timeEstimate: "1 hour",
      priority: "high",
      expectedOutcome: "3-5 positive responses"
    },
    {
      action: "Contact Current Clients",
      description: "Ask 3 development clients about hiring needs",
      timeEstimate: "1 hour",
      priority: "high",
      expectedOutcome: "1-2 recruiting opportunities"
    },
    {
      action: "Send Lead Generation Emails",
      description: "5 cold outreach emails using proven templates",
      timeEstimate: "1 hour",
      priority: "high",
      expectedOutcome: "1-2 qualified prospects"
    }
  ];

  const revenueTimeline = [
    {
      timeframe: "Week 1-2",
      milestone: "First Warm Responses",
      activities: ["Network mapping", "Warm outreach", "Client conversations"],
      expectedOutcome: "5-10 positive responses"
    },
    {
      timeframe: "Week 3-4",
      milestone: "Qualified Meetings",
      activities: ["Discovery calls", "Needs assessment", "Proposal preparation"],
      expectedOutcome: "3-5 qualified meetings"
    },
    {
      timeframe: "Month 2",
      milestone: "First Contracts",
      activities: ["Contract negotiation", "Service delivery setup", "Client onboarding"],
      expectedOutcome: "First recruiting client signed"
    },
    {
      timeframe: "Month 3",
      milestone: "First Revenue",
      activities: ["Candidate placements", "Fee collection", "Client expansion"],
      expectedOutcome: "$15-30K in recruiting fees"
    }
  ];

  const businessMetrics = [
    { metric: "Email Response Rate", target: "18-22%", tool: "Proven templates" },
    { metric: "Network Response Rate", target: "70-80%", tool: "Warm outreach" },
    { metric: "LinkedIn Acceptance", target: "35%", tool: "Connection requests" },
    { metric: "Cold Outreach Response", target: "10-15%", tool: "Value-first approach" },
    { metric: "Recruiting Fee Rate", target: "18-25%", tool: "Of first year salary" },
    { metric: "Time to Fill", target: "2-6 weeks", tool: "Average placement" }
  ];

  const technicalIntegrations = [
    {
      service: "LinkedIn Recruiter Lite",
      cost: "$140/month",
      priority: "Critical",
      purpose: "Candidate sourcing and networking",
      status: "pending"
    },
    {
      service: "Email Automation (SendGrid/Mailgun)",
      cost: "$15-50/month",
      priority: "High",
      purpose: "Automated outreach sequences",
      status: "pending"
    },
    {
      service: "Lead Data API (Apollo.io/ZoomInfo)",
      cost: "$49-99/month",
      priority: "High",
      purpose: "Prospect discovery and enrichment",
      status: "pending"
    },
    {
      service: "Email Tracking",
      cost: "Included",
      priority: "Medium",
      purpose: "Open/click tracking for outreach",
      status: "pending"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Complete Business System Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
          Comprehensive record of your lead generation and recruiting business platform - everything built, ready to execute, and planned for growth
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/action-plan">
            <Button>
              <Target className="mr-2 h-4 w-4" />
              View Action Plan
            </Button>
          </Link>
          <Link href="/business-tools">
            <Button variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Access All Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* System Overview */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Award className="h-6 w-6" />
            </div>
            Complete Business System Overview
          </CardTitle>
          <CardDescription className="text-lg">
            Your comprehensive lead generation and recruiting business platform is fully operational
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-green-600 mb-2">9</div>
              <div className="text-sm font-medium">Core Features Built</div>
              <div className="text-xs text-muted-foreground">Ready for immediate use</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
              <div className="text-sm font-medium">Revenue Streams</div>
              <div className="text-xs text-muted-foreground">Development + Recruiting</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-purple-600 mb-2">$30K+</div>
              <div className="text-sm font-medium">Monthly Revenue Potential</div>
              <div className="text-xs text-muted-foreground">Within 3 months</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Features */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">✅ Completed Features & Tools</h2>
            <p className="text-muted-foreground">All systems built and ready for execution</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {completedFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                </div>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.path}>
                  <Button size="sm" className="w-full">
                    Access Tool
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Immediate Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Zap className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">🎯 Immediate Actions (This Week)</h2>
            <p className="text-muted-foreground">High-priority tasks for immediate revenue generation</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {immediateActions.map((action, index) => (
            <Card key={index} className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{action.action}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                      {action.priority}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {action.timeEstimate}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Expected Outcome:</div>
                  <div className="text-sm text-green-700">{action.expectedOutcome}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Timeline */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">💰 Revenue Timeline & Milestones</h2>
            <p className="text-muted-foreground">Expected progression from execution to revenue</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {revenueTimeline.map((milestone, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{milestone.timeframe}</CardTitle>
                    <Badge variant="outline" className="mt-1">{milestone.milestone}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Key Activities:</div>
                  <ul className="text-xs space-y-1">
                    {milestone.activities.map((activity, actIndex) => (
                      <li key={actIndex} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm font-semibold text-green-600 pt-2">
                    {milestone.expectedOutcome}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">📊 Expected Performance Metrics</h2>
            <p className="text-muted-foreground">Realistic benchmarks based on proven strategies</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {businessMetrics.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{item.target}</div>
                  <div className="font-medium">{item.metric}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.tool}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technical Integrations */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Building className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">🔧 Required Technical Integrations</h2>
            <p className="text-muted-foreground">Essential services to scale your operations</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {technicalIntegrations.map((integration, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{integration.service}</CardTitle>
                  <Badge variant={integration.priority === 'Critical' ? 'destructive' : integration.priority === 'High' ? 'default' : 'secondary'}>
                    {integration.priority}
                  </Badge>
                </div>
                <CardDescription>{integration.purpose}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-green-600">{integration.cost}</div>
                    <div className="text-sm text-muted-foreground">Monthly cost</div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50">
                    Pending Setup
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Linear Project Integration */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-purple-600 text-white rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            Linear Project Integration
          </CardTitle>
          <CardDescription className="text-lg">
            All features and future enhancements tracked in Linear project management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">✅ Completed Issues</h3>
                <ul className="text-sm space-y-1">
                  <li>• BRI-537: Business Tools Dashboard</li>
                  <li>• BRI-474: Recruiting Business System</li>
                  <li>• BRI-408: Lead Generation & Outreach</li>
                  <li>• BRI-321: Contract & Proposal Management</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔄 Next Priorities</h3>
                <ul className="text-sm space-y-1">
                  <li>• BRI-538: Email Automation & Tracking</li>
                  <li>• BRI-539: Lead Data API Integration</li>
                  <li>• BRI-540: LinkedIn Recruiter Integration</li>
                  <li>• BRI-541: Revenue Analytics Dashboard</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Project: Agency Base</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete project roadmap and issue tracking available in Linear workspace
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Framework */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-green-600 text-white rounded-lg">
              <Star className="h-6 w-6" />
            </div>
            Success Framework Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-green-800 mb-3">✅ What's Complete</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Complete business tools platform
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Lead generation and CRM system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Full recruiting business platform
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Network mapping and outreach tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Action plan and execution roadmap
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Linear project management integration
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 mb-3">🎯 Next Steps</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Map professional network (50+ contacts)
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Send 5 warm recruiting emails
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Contact current clients about hiring
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Set up technical integrations
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Execute lead generation campaigns
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Track and optimize performance
                </li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">🚀 Ready for Execution</h3>
            <p className="text-muted-foreground mb-4">
              Your complete business system is built and operational. Time to execute and generate revenue.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/recruiting/network-mapping">
                <Button>
                  <Users className="mr-2 h-4 w-4" />
                  Start Network Mapping
                </Button>
              </Link>
              <Link href="/action-plan">
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  View Action Plan
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
