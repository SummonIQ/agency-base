interface ActionPlanTask {
  title: string;
  description?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours?: number;
  tags: string[];
  source: string;
  sourceId: string;
  subTasks?: ActionPlanTask[];
}

const convertTimeEstimateToHours = (timeEstimate: string): number => {
  const match = timeEstimate.match(/(\d+)(?:-(\d+))?\s*hours?/i);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    return (min + max) / 2;
  }
  return 2; // default
};

const convertPriority = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'HIGH';
    case 'medium':
      return 'MEDIUM';
    case 'low':
      return 'LOW';
    case 'urgent':
      return 'URGENT';
    default:
      return 'MEDIUM';
  }
};

export const ACTION_PLAN_TASKS: ActionPlanTask[] = [
  {
    title: "Find 20 High-Quality Prospects",
    description: "Use Apollo.io integration to find tech companies (React/Node.js stack) with 50-200 employees, $10M+ revenue, recent funding/growth. Target CTOs, VP Engineering, Heads of Product in SF Bay Area, Austin, NYC, Seattle.",
    category: "Lead Generation",
    priority: "HIGH",
    estimatedHours: 2.5,
    tags: ["prospecting", "apollo.io", "lead-generation", "research"],
    source: "action-plan",
    sourceId: "prospect-research",
    subTasks: [
      {
        title: "Search companies using filters: Tech industry, 50-200 employees, $10M+ revenue",
        category: "Lead Generation",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["apollo.io", "company-search"],
        source: "action-plan",
        sourceId: "prospect-research-step-1"
      },
      {
        title: "Identify decision makers: CTO, VP Eng, Head of Product roles",
        category: "Lead Generation",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["decision-makers", "contacts"],
        source: "action-plan",
        sourceId: "prospect-research-step-2"
      },
      {
        title: "Enrich contact data using Apollo.io integration",
        category: "Lead Generation",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["data-enrichment", "apollo.io"],
        source: "action-plan",
        sourceId: "prospect-research-step-3"
      },
      {
        title: "Research recent company news, funding, product launches",
        category: "Lead Generation",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["research", "company-intelligence"],
        source: "action-plan",
        sourceId: "prospect-research-step-4"
      },
      {
        title: "Score prospects 1-5 based on fit and timing",
        category: "Lead Generation",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["scoring", "qualification"],
        source: "action-plan",
        sourceId: "prospect-research-step-5"
      },
      {
        title: "Save all data to CRM with notes and next actions",
        category: "Lead Generation",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["crm", "data-entry"],
        source: "action-plan",
        sourceId: "prospect-research-step-6"
      }
    ]
  },
  {
    title: "Launch Personalized Email Campaign (5 prospects)",
    description: "Send highly personalized emails using 'Value-First Approach' template. Offer free technical audit/consultation specific to each company's stack and challenges. Track opens/replies.",
    category: "Marketing",
    priority: "HIGH",
    estimatedHours: 2,
    tags: ["email-campaign", "outreach", "personalization"],
    source: "action-plan",
    sourceId: "email-campaign",
    subTasks: [
      {
        title: "Select top 5 prospects from research (highest scoring)",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["prospect-selection"],
        source: "action-plan",
        sourceId: "email-campaign-step-1"
      },
      {
        title: "Customize email template with specific company details",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["email-templates", "personalization"],
        source: "action-plan",
        sourceId: "email-campaign-step-2"
      },
      {
        title: "Reference recent company news, tech stack, or challenges",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["research", "personalization"],
        source: "action-plan",
        sourceId: "email-campaign-step-3"
      },
      {
        title: "Craft specific audit offer (React performance, Node.js scaling, etc.)",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["value-proposition", "technical-audit"],
        source: "action-plan",
        sourceId: "email-campaign-step-4"
      },
      {
        title: "Set up automated follow-up sequence (3-5 touchpoints)",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["automation", "follow-up"],
        source: "action-plan",
        sourceId: "email-campaign-step-5"
      },
      {
        title: "Configure tracking and response alerts",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.125,
        tags: ["tracking", "analytics"],
        source: "action-plan",
        sourceId: "email-campaign-step-6"
      },
      {
        title: "Schedule sends for optimal timing (Tue-Thu, 10am-2pm)",
        category: "Marketing",
        priority: "HIGH",
        estimatedHours: 0.125,
        tags: ["scheduling", "timing"],
        source: "action-plan",
        sourceId: "email-campaign-step-7"
      }
    ]
  },
  {
    title: "Build Professional Network Map (100+ contacts)",
    description: "Create comprehensive contact database of professional network including former colleagues, clients, freelancers, contractors, meetup connections, conference contacts. Categorize by relationship strength and recruiting potential.",
    category: "Business Development",
    priority: "HIGH",
    estimatedHours: 4.5,
    tags: ["networking", "contacts", "database", "recruiting"],
    source: "action-plan",
    sourceId: "network-mapping",
    subTasks: [
      {
        title: "Export contacts from LinkedIn, email, phone, Slack workspaces",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 1,
        tags: ["data-export", "contacts"],
        source: "action-plan",
        sourceId: "network-mapping-step-1"
      },
      {
        title: "Categorize: Former colleagues, clients, contractors, meetup/conference contacts",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 1,
        tags: ["categorization", "organization"],
        source: "action-plan",
        sourceId: "network-mapping-step-2"
      },
      {
        title: "Update current employment info via LinkedIn research",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 1.5,
        tags: ["research", "linkedin", "employment"],
        source: "action-plan",
        sourceId: "network-mapping-step-3"
      },
      {
        title: "Score relationship strength: A (close), B (professional), C (acquaintance)",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["scoring", "relationships"],
        source: "action-plan",
        sourceId: "network-mapping-step-4"
      },
      {
        title: "Assess recruiting potential: hiring manager, referrer, candidate source",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["recruiting", "assessment"],
        source: "action-plan",
        sourceId: "network-mapping-step-5"
      },
      {
        title: "Create outreach priority list starting with A-tier contacts",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["prioritization", "outreach"],
        source: "action-plan",
        sourceId: "network-mapping-step-6"
      },
      {
        title: "Draft personalized messages for top 20 contacts",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.75,
        tags: ["messaging", "personalization"],
        source: "action-plan",
        sourceId: "network-mapping-step-7"
      }
    ]
  },
  {
    title: "Execute Warm Recruiting Outreach (10 contacts)",
    description: "Send personalized messages to former colleagues and professional connections about expanding into technical recruiting. Focus on building recruiting pipeline and getting referrals for open positions.",
    category: "Business Development",
    priority: "HIGH",
    estimatedHours: 2.5,
    tags: ["recruiting", "warm-outreach", "referrals"],
    source: "action-plan",
    sourceId: "warm-recruiting",
    subTasks: [
      {
        title: "Select 10 A-tier contacts from network map (former colleagues, trusted connections)",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["contact-selection", "networking"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-1"
      },
      {
        title: "Craft personalized messages mentioning shared history/projects",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 1,
        tags: ["messaging", "personalization"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-2"
      },
      {
        title: "Explain recruiting expansion with focus on tech talent",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["positioning", "recruiting"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-3"
      },
      {
        title: "Attach recruiting services overview and fee structure",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["sales-materials", "pricing"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-4"
      },
      {
        title: "Request 15-min coffee chat or video call to discuss",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["meeting-requests", "calls"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-5"
      },
      {
        title: "Set up tracking for responses and follow-ups",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.125,
        tags: ["tracking", "follow-up"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-6"
      },
      {
        title: "Schedule any requested meetings within 48 hours",
        category: "Business Development",
        priority: "HIGH",
        estimatedHours: 0.125,
        tags: ["scheduling", "meetings"],
        source: "action-plan",
        sourceId: "warm-recruiting-step-7"
      }
    ]
  },
  {
    title: "Cross-sell Recruiting to Agency Clients (5 clients)",
    description: "Contact existing development clients to discuss their hiring challenges and introduce recruiting services. Focus on companies you've worked with who trust your technical judgment and are likely growing their teams.",
    category: "Sales",
    priority: "HIGH",
    estimatedHours: 2,
    tags: ["cross-sell", "recruiting", "clients"],
    source: "action-plan",
    sourceId: "client-cross-sell",
    subTasks: [
      {
        title: "Review agency client list and identify growing companies",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["client-review", "analysis"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-1"
      },
      {
        title: "Research each client's recent hiring activity (LinkedIn, company pages)",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["research", "hiring-activity"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-2"
      },
      {
        title: "Schedule calls framed as 'checking in on project success'",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["scheduling", "client-calls"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-3"
      },
      {
        title: "Naturally transition to discussing team growth and hiring challenges",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.5,
        tags: ["conversation", "needs-discovery"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-4"
      },
      {
        title: "Present recruiting services as extension of development partnership",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.25,
        tags: ["positioning", "sales-pitch"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-5"
      },
      {
        title: "Offer to help with 1-2 positions as pilot engagement",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.125,
        tags: ["pilot-program", "trial"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-6"
      },
      {
        title: "Follow up with formal recruiting proposal within 24 hours",
        category: "Sales",
        priority: "HIGH",
        estimatedHours: 0.125,
        tags: ["proposals", "follow-up"],
        source: "action-plan",
        sourceId: "client-cross-sell-step-7"
      }
    ]
  },
  {
    title: "Set Up Revenue Analytics & Tracking",
    description: "Configure comprehensive performance tracking for all business activities including email campaigns, LinkedIn outreach, network responses, and pipeline progression. Essential for optimizing conversion rates.",
    category: "Operations",
    priority: "MEDIUM",
    estimatedHours: 1.5,
    tags: ["analytics", "tracking", "metrics"],
    source: "action-plan",
    sourceId: "revenue-analytics",
    subTasks: [
      {
        title: "Configure SendGrid API for email tracking (opens, clicks, replies)",
        category: "Operations",
        priority: "MEDIUM",
        estimatedHours: 0.25,
        tags: ["sendgrid", "email-tracking"],
        source: "action-plan",
        sourceId: "revenue-analytics-step-1"
      },
      {
        title: "Set up LinkedIn automation tracking for connection/message stats",
        category: "Operations",
        priority: "MEDIUM",
        estimatedHours: 0.25,
        tags: ["linkedin", "automation-tracking"],
        source: "action-plan",
        sourceId: "revenue-analytics-step-2"
      },
      {
        title: "Create pipeline stages: Lead → Qualified → Proposal → Client",
        category: "Operations",
        priority: "MEDIUM",
        estimatedHours: 0.25,
        tags: ["pipeline", "stages"],
        source: "action-plan",
        sourceId: "revenue-analytics-step-3"
      },
      {
        title: "Configure conversion tracking between stages",
        category: "Operations",
        priority: "MEDIUM",
        estimatedHours: 0.25,
        tags: ["conversion-tracking", "analytics"],
        source: "action-plan",
        sourceId: "revenue-analytics-step-4"
      },
      {
        title: "Set up weekly automated reports",
        category: "Operations",
        priority: "MEDIUM",
        estimatedHours: 0.25,
        tags: ["reporting", "automation"],
        source: "action-plan",
        sourceId: "revenue-analytics-step-5"
      },
      {
        title: "Create dashboard widgets for key metrics",
        category: "Operations",
        priority: "MEDIUM",
        estimatedHours: 0.25,
        tags: ["dashboard", "widgets"],
        source: "action-plan",
        sourceId: "revenue-analytics-step-6"
      }
    ]
  },
  {
    title: "Launch LinkedIn Prospecting Campaign",
    description: "Use LinkedIn Recruiter Lite to identify and connect with potential recruiting clients and candidates. Focus on CTOs, VPs of Engineering, and senior developers who could become clients or candidates.",
    category: "Marketing",
    priority: "MEDIUM",
    estimatedHours: 2.5,
    tags: ["linkedin", "prospecting", "recruiting"],
    source: "action-plan",
    sourceId: "linkedin-prospecting",
    subTasks: [
      {
        title: "Search for CTOs/VPs at tech companies (client prospects)",
        category: "Marketing",
        priority: "MEDIUM",
        estimatedHours: 0.5,
        tags: ["linkedin-search", "client-prospects"],
        source: "action-plan",
        sourceId: "linkedin-prospecting-step-1"
      },
      {
        title: "Search for senior developers at target companies (candidates)",
        category: "Marketing",
        priority: "MEDIUM",
        estimatedHours: 0.5,
        tags: ["linkedin-search", "candidates"],
        source: "action-plan",
        sourceId: "linkedin-prospecting-step-2"
      },
      {
        title: "Craft personalized connection requests mentioning mutual connections/interests",
        category: "Marketing",
        priority: "MEDIUM",
        estimatedHours: 0.75,
        tags: ["personalization", "connection-requests"],
        source: "action-plan",
        sourceId: "linkedin-prospecting-step-3"
      },
      {
        title: "Set up automated message sequence for accepted connections",
        category: "Marketing",
        priority: "MEDIUM",
        estimatedHours: 0.5,
        tags: ["automation", "messaging"],
        source: "action-plan",
        sourceId: "linkedin-prospecting-step-4"
      },
      {
        title: "Configure response tracking and CRM integration",
        category: "Marketing",
        priority: "MEDIUM",
        estimatedHours: 0.125,
        tags: ["tracking", "crm-integration"],
        source: "action-plan",
        sourceId: "linkedin-prospecting-step-5"
      },
      {
        title: "Schedule daily connection requests (10-15 per day)",
        category: "Marketing",
        priority: "MEDIUM",
        estimatedHours: 0.125,
        tags: ["scheduling", "daily-tasks"],
        source: "action-plan",
        sourceId: "linkedin-prospecting-step-6"
      }
    ]
  },
  {
    title: "Create Content Marketing Foundation",
    description: "Develop thought leadership content to establish credibility in technical recruiting. Create blog posts, LinkedIn articles, and social media content that demonstrates expertise in tech talent assessment.",
    category: "Marketing",
    priority: "LOW",
    estimatedHours: 3.5,
    tags: ["content-marketing", "thought-leadership", "recruiting"],
    source: "action-plan",
    sourceId: "content-marketing",
    subTasks: [
      {
        title: "Research trending topics in tech hiring and recruitment",
        category: "Marketing",
        priority: "LOW",
        estimatedHours: 0.5,
        tags: ["research", "trending-topics"],
        source: "action-plan",
        sourceId: "content-marketing-step-1"
      },
      {
        title: "Outline 3 blog posts: 'Hiring React Developers', 'Technical Interview Best Practices', 'Remote Team Building'",
        category: "Marketing",
        priority: "LOW",
        estimatedHours: 0.75,
        tags: ["blog-posts", "content-planning"],
        source: "action-plan",
        sourceId: "content-marketing-step-2"
      },
      {
        title: "Write and publish first LinkedIn article about common hiring mistakes",
        category: "Marketing",
        priority: "LOW",
        estimatedHours: 1,
        tags: ["linkedin-articles", "writing"],
        source: "action-plan",
        sourceId: "content-marketing-step-3"
      },
      {
        title: "Create 30-day social media calendar with daily tips/insights",
        category: "Marketing",
        priority: "LOW",
        estimatedHours: 0.75,
        tags: ["social-media", "content-calendar"],
        source: "action-plan",
        sourceId: "content-marketing-step-4"
      },
      {
        title: "Design email newsletter template for monthly recruiting insights",
        category: "Marketing",
        priority: "LOW",
        estimatedHours: 0.25,
        tags: ["email-newsletter", "templates"],
        source: "action-plan",
        sourceId: "content-marketing-step-5"
      },
      {
        title: "Set up content distribution schedule across platforms",
        category: "Marketing",
        priority: "LOW",
        estimatedHours: 0.25,
        tags: ["distribution", "scheduling"],
        source: "action-plan",
        sourceId: "content-marketing-step-6"
      }
    ]
  }
];