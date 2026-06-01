export interface ProspectCompany {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  revenue?: string;
  employees?: number;
  techStack?: string[];
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  description?: string;
  foundedYear?: number;
  funding?: {
    stage?: string;
    amount?: string;
    lastRound?: string;
  };
}

export interface ProspectContact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle: string;
  department: string;
  seniority: 'entry' | 'mid' | 'senior' | 'executive' | 'c-level';
  linkedinUrl?: string;
  companyId: string;
  verified: boolean;
  lastContacted?: Date;
}

export interface LeadScore {
  overall: number;
  factors: {
    companySize: number;
    industry: number;
    techStack: number;
    recentActivity: number;
    contactSeniority: number;
  };
  reasoning: string[];
}

export interface OutreachTemplate {
  id: string;
  name: string;
  type: 'email' | 'linkedin';
  subject?: string;
  content: string;
  variables: string[];
  industry?: string;
  companySize?: string;
  useCase: string;
  conversionRate?: number;
}

export interface OutreachSequence {
  id: string;
  name: string;
  steps: OutreachStep[];
  triggers: SequenceTrigger[];
  active: boolean;
}

export interface OutreachStep {
  id: string;
  sequenceId: string;
  stepNumber: number;
  type: 'email' | 'linkedin' | 'wait';
  templateId?: string;
  waitDays?: number;
  conditions?: StepCondition[];
}

export interface SequenceTrigger {
  event: 'no_response' | 'email_opened' | 'email_clicked' | 'linkedin_viewed';
  waitDays: number;
  nextStepId: string;
}

export interface StepCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  sequenceId: string;
  prospects: string[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  meetings: number;
  deals: number;
}

export interface ProspectResearch {
  company: ProspectCompany;
  contacts: ProspectContact[];
  recentNews?: NewsItem[];
  competitors?: string[];
  painPoints?: string[];
  opportunities?: string[];
  recommendedApproach?: string;
}

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: Date;
  source: string;
  summary?: string;
}
