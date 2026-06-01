import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target,
  Users,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Network,
  Building,
  Phone,
  Linkedin,
  FileText,
  BarChart3,
  AlertCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default async function ActionPlanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const thisWeekTasks = [
    {
      id: 1,
      title: "Find 20 High-Quality Prospects",
      description: "Use Apollo.io integration to find tech companies (React/Node.js stack) with 50-200 employees, $10M+ revenue, recent funding/growth. Target CTOs, VP Engineering, Heads of Product in SF Bay Area, Austin, NYC, Seattle.",
      priority: "high",
      timeEstimate: "2-3 hours",
      link: "/lead-data-integration",
      deliverables: [
        "20 qualified prospect profiles saved in system",
        "Contact info enriched (email, phone, LinkedIn)",
        "Company research notes for each prospect",
        "Prioritized outreach list (1-5 rating)"
      ],
      steps: [
        "Search companies using filters: Tech industry, 50-200 employees, $10M+ revenue",
        "Identify decision makers: CTO, VP Eng, Head of Product roles",
        "Enrich contact data using Apollo.io integration",
        "Research recent company news, funding, product launches",
        "Score prospects 1-5 based on fit and timing",
        "Save all data to CRM with notes and next actions"
      ],
      successCriteria: "20 prospects with complete profiles, valid email addresses, and research notes ready for personalized outreach"
    },
    {
      id: 2,
      title: "Launch Personalized Email Campaign (5 prospects)",
      description: "Send highly personalized emails using 'Value-First Approach' template. Offer free technical audit/consultation specific to each company's stack and challenges. Track opens/replies.",
      priority: "high",
      timeEstimate: "2 hours",
      link: "/email-automation",
      deliverables: [
        "5 personalized emails sent with custom value props",
        "Follow-up sequence activated for each prospect",
        "Email tracking configured for opens/clicks",
        "Response handling process documented"
      ],
      steps: [
        "Select top 5 prospects from research (highest scoring)",
        "Customize email template with specific company details",
        "Reference recent company news, tech stack, or challenges",
        "Craft specific audit offer (React performance, Node.js scaling, etc.)",
        "Set up automated follow-up sequence (3-5 touchpoints)",
        "Configure tracking and response alerts",
        "Schedule sends for optimal timing (Tue-Thu, 10am-2pm)"
      ],
      successCriteria: "5 emails sent with 18-22% open rate, 3-5% reply rate expected, follow-up sequences active"
    },
    {
      id: 3,
      title: "Build Professional Network Map (100+ contacts)",
      description: "Create comprehensive contact database of professional network including former colleagues, clients, freelancers, contractors, meetup connections, conference contacts. Categorize by relationship strength and recruiting potential.",
      priority: "high",
      timeEstimate: "4-5 hours",
      link: "/recruiting/network-mapping",
      deliverables: [
        "Network spreadsheet with 100+ contacts organized by category",
        "Contact info updated (email, phone, LinkedIn, current company)",
        "Relationship strength scoring (A/B/C tier)",
        "Recruiting potential assessment for each contact",
        "Prioritized outreach list of top 20 warm contacts"
      ],
      steps: [
        "Export contacts from LinkedIn, email, phone, Slack workspaces",
        "Categorize: Former colleagues, clients, contractors, meetup/conference contacts",
        "Update current employment info via LinkedIn research",
        "Score relationship strength: A (close), B (professional), C (acquaintance)",
        "Assess recruiting potential: hiring manager, referrer, candidate source",
        "Create outreach priority list starting with A-tier contacts",
        "Draft personalized messages for top 20 contacts"
      ],
      successCriteria: "Complete network map with 100+ contacts, relationship scoring, and 20 warm outreach messages ready to send"
    },
    {
      id: 4,
      title: "Execute Warm Recruiting Outreach (10 contacts)",
      description: "Send personalized messages to former colleagues and professional connections about expanding into technical recruiting. Focus on building recruiting pipeline and getting referrals for open positions.",
      priority: "high",
      timeEstimate: "2-3 hours",
      link: "/recruiting",
      deliverables: [
        "10 warm outreach messages sent to A-tier network contacts",
        "Recruiting service one-pager created and shared",
        "Meeting requests sent to interested contacts",
        "Referral tracking system activated"
      ],
      steps: [
        "Select 10 A-tier contacts from network map (former colleagues, trusted connections)",
        "Craft personalized messages mentioning shared history/projects",
        "Explain recruiting expansion with focus on tech talent",
        "Attach recruiting services overview and fee structure",
        "Request 15-min coffee chat or video call to discuss",
        "Set up tracking for responses and follow-ups",
        "Schedule any requested meetings within 48 hours"
      ],
      successCriteria: "10 messages sent with 70-80% response rate expected, 3-5 meetings scheduled, referral pipeline activated"
    },
    {
      id: 5,
      title: "Cross-sell Recruiting to Agency Clients (5 clients)",
      description: "Contact existing development clients to discuss their hiring challenges and introduce recruiting services. Focus on companies you've worked with who trust your technical judgment and are likely growing their teams.",
      priority: "high",
      timeEstimate: "2 hours",
      link: "/agency-leads",
      deliverables: [
        "5 client conversations completed about hiring needs",
        "Recruiting proposal sent to interested clients",
        "Job requisitions collected for open positions",
        "Cross-sell pipeline established in CRM"
      ],
      steps: [
        "Review agency client list and identify growing companies",
        "Research each client's recent hiring activity (LinkedIn, company pages)",
        "Schedule calls framed as 'checking in on project success'",
        "Naturally transition to discussing team growth and hiring challenges",
        "Present recruiting services as extension of development partnership",
        "Offer to help with 1-2 positions as pilot engagement",
        "Follow up with formal recruiting proposal within 24 hours"
      ],
      successCriteria: "5 client calls completed, 2-3 recruiting opportunities identified, 1-2 formal proposals sent"
    },
    {
      id: 6,
      title: "Set Up Revenue Analytics & Tracking",
      description: "Configure comprehensive performance tracking for all business activities including email campaigns, LinkedIn outreach, network responses, and pipeline progression. Essential for optimizing conversion rates.",
      priority: "medium",
      timeEstimate: "1-2 hours",
      link: "/revenue-analytics",
      deliverables: [
        "Email tracking configured with SendGrid integration",
        "LinkedIn automation metrics activated",
        "Pipeline tracking set up for all prospects",
        "Weekly performance reporting scheduled"
      ],
      steps: [
        "Configure SendGrid API for email tracking (opens, clicks, replies)",
        "Set up LinkedIn automation tracking for connection/message stats",
        "Create pipeline stages: Lead → Qualified → Proposal → Client",
        "Configure conversion tracking between stages",
        "Set up weekly automated reports",
        "Create dashboard widgets for key metrics"
      ],
      successCriteria: "Complete tracking system operational, baseline metrics established, automated reporting configured"
    },
    {
      id: 7,
      title: "Launch LinkedIn Prospecting Campaign",
      description: "Use LinkedIn Recruiter Lite to identify and connect with potential recruiting clients and candidates. Focus on CTOs, VPs of Engineering, and senior developers who could become clients or candidates.",
      priority: "medium",
      timeEstimate: "2-3 hours",
      link: "/linkedin-integration",
      deliverables: [
        "50 targeted LinkedIn connections sent (25 clients, 25 candidates)",
        "Personalized connection messages crafted for each prospect",
        "LinkedIn automation sequence activated",
        "Response tracking and follow-up system configured"
      ],
      steps: [
        "Search for CTOs/VPs at tech companies (client prospects)",
        "Search for senior developers at target companies (candidates)",
        "Craft personalized connection requests mentioning mutual connections/interests",
        "Set up automated message sequence for accepted connections",
        "Configure response tracking and CRM integration",
        "Schedule daily connection requests (10-15 per day)"
      ],
      successCriteria: "50 LinkedIn connections sent with 35% acceptance rate expected, automated follow-up active"
    },
    {
      id: 8,
      title: "Create Content Marketing Foundation",
      description: "Develop thought leadership content to establish credibility in technical recruiting. Create blog posts, LinkedIn articles, and social media content that demonstrates expertise in tech talent assessment.",
      priority: "low",
      timeEstimate: "3-4 hours",
      link: "/business-intelligence",
      deliverables: [
        "3 blog post topics outlined with SEO keywords",
        "LinkedIn article published about tech hiring challenges",
        "Social media content calendar created (30 days)",
        "Email newsletter template designed for recruiting insights"
      ],
      steps: [
        "Research trending topics in tech hiring and recruitment",
        "Outline 3 blog posts: 'Hiring React Developers', 'Technical Interview Best Practices', 'Remote Team Building'",
        "Write and publish first LinkedIn article about common hiring mistakes",
        "Create 30-day social media calendar with daily tips/insights",
        "Design email newsletter template for monthly recruiting insights",
        "Set up content distribution schedule across platforms"
      ],
      successCriteria: "Content foundation established, first article published, 30-day content calendar ready for execution"
    }
  ];

  const technicalSetup = [
    {
      title: "LinkedIn Recruiter Lite & Sales Navigator",
      description: "Critical for advanced candidate sourcing, InMail credits, and detailed company insights. Enables Boolean search, saved searches, and bulk messaging capabilities.",
      cost: "$140/month (Recruiter Lite) + $80/month (Sales Navigator)",
      priority: "Critical",
      timeframe: "This week",
      setup: [
        "Purchase LinkedIn Recruiter Lite subscription",
        "Add LinkedIn Sales Navigator for company insights",
        "Configure Boolean search templates for common roles",
        "Set up saved searches for target companies and candidates",
        "Create InMail templates for candidate outreach",
        "Integrate with CRM for prospect tracking"
      ],
      expectedROI: "1 placement pays for 12+ months of subscription",
      businessImpact: "Access to 900M+ LinkedIn profiles, advanced filtering, InMail messaging"
    },
    {
      title: "SendGrid Email Automation Platform",
      description: "Professional email delivery, automation sequences, A/B testing, and comprehensive analytics. Essential for scaling outreach while maintaining deliverability.",
      cost: "$15-89/month (based on volume)",
      priority: "High",
      timeframe: "Week 2",
      setup: [
        "Create SendGrid account and verify domain",
        "Configure SPF, DKIM, and DMARC records",
        "Set up email templates with variable substitution",
        "Create automation sequences for different prospect types",
        "Configure webhook integration for real-time tracking",
        "Set up suppression lists and bounce management"
      ],
      expectedROI: "Improves email deliverability by 40%+, increases response rates by 25%",
      businessImpact: "Professional email delivery, automation sequences, detailed analytics"
    },
    {
      title: "Apollo.io Lead Intelligence",
      description: "Advanced prospect database with 275M+ contacts, company intelligence, email finder, and engagement tracking. Critical for identifying high-value prospects.",
      cost: "$49-149/month (based on features)",
      priority: "High",
      timeframe: "Week 2",
      setup: [
        "Purchase Apollo.io Professional plan",
        "Configure prospect search filters and saved searches",
        "Set up email finder and verification workflows",
        "Create prospect scoring and tagging system",
        "Configure CRM integration for data sync",
        "Set up engagement tracking and analytics"
      ],
      expectedROI: "Increases qualified prospect volume by 300%, improves targeting accuracy",
      businessImpact: "Access to verified contact data, company intelligence, engagement tracking"
    },
    {
      title: "Advanced Email & LinkedIn Tracking",
      description: "Comprehensive tracking suite including email opens, clicks, replies, LinkedIn profile views, message reads, and conversion attribution.",
      cost: "Included with above tools",
      priority: "High",
      timeframe: "Week 2",
      setup: [
        "Configure pixel tracking for email campaigns",
        "Set up LinkedIn activity monitoring",
        "Create conversion attribution tracking",
        "Configure real-time notification system",
        "Set up automated response scoring",
        "Create performance dashboard with key metrics"
      ],
      expectedROI: "Improves conversion rates by 35% through better timing and follow-up",
      businessImpact: "Data-driven optimization, improved response timing, conversion attribution"
    },
    {
      title: "CRM Integration & Automation",
      description: "Integrate all tools into unified CRM system with automated data sync, lead scoring, and pipeline management. Eliminates manual data entry.",
      cost: "Setup time investment",
      priority: "Medium",
      timeframe: "Week 3",
      setup: [
        "Configure API integrations between all platforms",
        "Set up automated data sync workflows",
        "Create lead scoring algorithm based on engagement",
        "Configure automated pipeline progression",
        "Set up automated reporting and alerts",
        "Create backup and data recovery procedures"
      ],
      expectedROI: "Saves 10+ hours/week on manual data entry and follow-up",
      businessImpact: "Unified data, automated workflows, improved efficiency"
    },
    {
      title: "Business Intelligence & Analytics",
      description: "Advanced analytics platform combining data from all sources to provide insights on prospect behavior, campaign performance, and revenue attribution.",
      cost: "Development time",
      priority: "Medium",
      timeframe: "Week 4",
      setup: [
        "Configure data warehouse for analytics",
        "Set up automated data pipeline from all sources",
        "Create custom dashboards for different metrics",
        "Configure predictive analytics for lead scoring",
        "Set up automated insights and recommendations",
        "Create executive reporting and KPI tracking"
      ],
      expectedROI: "Improves campaign performance by 50% through data-driven optimization",
      businessImpact: "Predictive insights, performance optimization, strategic decision making"
    }
  ];

  const revenueTimeline = [
    {
      timeframe: "Week 1-2",
      milestone: "First Warm Responses",
      description: "Initial interest from network outreach",
      expectedOutcome: "5-10 positive responses"
    },
    {
      timeframe: "Week 3-4", 
      milestone: "Client Meetings Scheduled",
      description: "Discovery calls with interested prospects",
      expectedOutcome: "3-5 qualified meetings"
    },
    {
      timeframe: "Month 2",
      milestone: "First Recruiting Client",
      description: "Signed contract for recruiting services",
      expectedOutcome: "$15-30K potential revenue"
    },
    {
      timeframe: "Month 3",
      milestone: "First Placement",
      description: "Successful candidate placement",
      expectedOutcome: "$15-30K actual revenue"
    }
  ];

  const templates = [
    {
      type: "Lead Generation",
      name: "Value-First Approach",
      conversionRate: "22%",
      subject: "Free development audit for {{companyName}}",
      preview: "Rather than pitch our services, I'd like to offer {{companyName}} a complimentary 30-minute development audit..."
    },
    {
      type: "Recruiting - Warm",
      name: "Former Colleague Outreach",
      conversionRate: "70-80%",
      subject: "Expanding into technical recruiting",
      preview: "Hi {{firstName}}, I'm starting a technical recruiting practice focused on {{niche}}. Given our history working together..."
    },
    {
      type: "Recruiting - Client",
      name: "Cross-sell to Agency Clients",
      conversionRate: "60-70%",
      subject: "Your hiring challenges",
      preview: "As we've been working together on {{project}}, I've noticed you're growing your engineering team..."
    },
    {
      type: "Lead Generation",
      name: "Cold Outreach",
      conversionRate: "10-15%",
      subject: "Quick question about {{companyName}}'s engineering hiring",
      preview: "I noticed {{companyName}} recently {{recentNews}}. As a former developer turned technical recruiter..."
    }
  ];

  const keyMetrics = [
    { metric: "Email Response Rate", target: "18-22%", tool: "Proven templates" },
    { metric: "LinkedIn Acceptance", target: "35%", tool: "Connection requests" },
    { metric: "Network Response", target: "70-80%", tool: "Warm outreach" },
    { metric: "Recruiting Fee", target: "18-25%", tool: "Of first year salary" },
    { metric: "Time to Fill", target: "2-6 weeks", tool: "Average placement" },
    { metric: "Cold Outreach", target: "10-15%", tool: "Response rate" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Your Business Growth Action Plan</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Step-by-step execution plan for lead generation and recruiting business success
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/business-tools">
            <Button>
              <ArrowRight className="mr-2 h-4 w-4" />
              View All Tools
            </Button>
          </Link>
          <Link href="/lead-generation">
            <Button variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Start Lead Generation
            </Button>
          </Link>
        </div>
      </div>

      {/* This Week Tasks */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            This Week's High-Priority Tasks
          </CardTitle>
          <CardDescription className="text-lg">
            Complete these 8 comprehensive tasks with detailed deliverables and step-by-step guidance to launch your lead generation and recruiting business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {thisWeekTasks.map((task) => (
              <Card key={task.id} className="p-6 bg-card border">
                <div className="flex items-start gap-4">
                  <Checkbox className="mt-1" />
                  <div className="flex-1 space-y-4">
                    {/* Task Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{task.title}</h3>
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.timeEstimate}
                        </Badge>
                      </div>
                      <Link href={task.link}>
                        <Button size="sm">
                          Start Task
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>

                    {/* Task Description */}
                    <p className="text-muted-foreground">{task.description}</p>

                    {/* Deliverables */}
                    {task.deliverables && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Key Deliverables
                        </h4>
                        <div className="space-y-2">
                          {task.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <Checkbox className="mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{deliverable}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Steps */}
                    {task.steps && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          <Network className="h-4 w-4 text-blue-500" />
                          Action Steps
                        </h4>
                        <div className="grid gap-2">
                          {task.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                              <Checkbox className="mt-0.5 flex-shrink-0" />
                              <div className="w-5 h-5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <span className="text-muted-foreground">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Criteria */}
                    {task.successCriteria && (
                      <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Success Criteria
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">{task.successCriteria}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Setup */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Technical Setup & Integrations</h2>
            <p className="text-muted-foreground">Essential tools to scale your outreach</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {technicalSetup.map((item, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <Badge variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>

                {/* Cost & Timeline */}
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-semibold text-green-600 dark:text-green-400">{item.cost}</div>
                    <div className="text-sm text-muted-foreground">Timeline: {item.timeframe}</div>
                  </div>
                  <Button size="sm" variant="outline">Setup Guide</Button>
                </div>

                {/* Setup Steps */}
                {item.setup && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      Setup Steps
                    </h4>
                    <div className="space-y-2">
                      {item.setup.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3 text-sm">
                          <Checkbox className="mt-0.5 flex-shrink-0" />
                          <div className="w-4 h-4 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {stepIndex + 1}
                          </div>
                          <span className="text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected ROI */}
                {item.expectedROI && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 mb-1">Expected ROI</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">{item.expectedROI}</p>
                  </div>
                )}

                {/* Business Impact */}
                {item.businessImpact && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-1">Business Impact</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{item.businessImpact}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Timeline */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Revenue Timeline & Milestones</h2>
            <p className="text-muted-foreground">Expected progression and earnings</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {revenueTimeline.map((milestone, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{milestone.timeframe}</CardTitle>
                    <Badge variant="outline" className="mt-1">{milestone.milestone}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">{milestone.expectedOutcome}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Proven Templates */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
            <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Proven Outreach Templates</h2>
            <p className="text-muted-foreground">Ready-to-use templates with conversion rates</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400">
                    <Star className="h-3 w-3 mr-1" />
                    {template.conversionRate}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Subject:</div>
                    <div className="text-sm text-muted-foreground">{template.subject}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Preview:</div>
                    <div className="text-sm text-muted-foreground italic">{template.preview}</div>
                  </div>
                  <Button size="sm" className="w-full">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-950/50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Expected Performance Metrics</h2>
            <p className="text-muted-foreground">Realistic benchmarks for success</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {keyMetrics.map((item, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.target}</div>
                  <div className="font-medium">{item.metric}</div>
                  <div className="text-sm text-muted-foreground mt-1">{item.tool}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Reference */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/30 border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            Quick Reference & Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="font-semibold">Lead Generation</h3>
              <div className="space-y-2 text-sm">
                <Link href="/lead-generation/search" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • Prospect Search Tool
                </Link>
                <Link href="/lead-generation" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • Outreach Templates
                </Link>
                <Link href="/agency-leads" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • Lead Management
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Recruiting Business</h3>
              <div className="space-y-2 text-sm">
                <Link href="/recruiting/training" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • Training Program
                </Link>
                <Link href="/recruiting" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • Recruiting Dashboard
                </Link>
                <Link href="/recruiting/candidates/search" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • Candidate Search
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Resources</h3>
              <div className="space-y-2 text-sm">
                <Link href="/business-tools" className="block text-blue-600 dark:text-blue-400 hover:underline">
                  • All Business Tools
                </Link>
                <div className="text-muted-foreground">• Network Mapping Template</div>
                <div className="text-muted-foreground">• Fee Calculator</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <AlertCircle className="h-5 w-5" />
            Remember: Start Small, Scale Fast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
            <p>• <strong>Week 1:</strong> Focus on warm outreach (70-80% response rate)</p>
            <p>• <strong>Week 2:</strong> Add cold outreach (10-15% response rate)</p>
            <p>• <strong>Month 1:</strong> First client meetings and recruiting conversations</p>
            <p>• <strong>Month 2:</strong> First contracts signed</p>
            <p>• <strong>Month 3:</strong> First placements and revenue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
