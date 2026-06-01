export interface RecruitingClient {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  industry: string;
  companySize: string;
  hiringVolume: 'low' | 'medium' | 'high';
  preferredFeeStructure: 'contingency' | 'retained' | 'hourly';
  contractStatus: 'prospect' | 'negotiating' | 'active' | 'inactive';
  signedDate?: Date;
  contractValue?: number;
  jobsPosted: number;
  successfulPlacements: number;
  averageTimeToFill: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobRequisition {
  id: string;
  clientId: string;
  title: string;
  department: string;
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'contract-to-hire';
  location: string;
  remote: 'no' | 'hybrid' | 'full';
  salaryMin?: number;
  salaryMax?: number;
  equity?: boolean;
  benefits?: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  education?: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  niceToHave: string[];
  status: 'intake' | 'active' | 'on-hold' | 'filled' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetStartDate?: Date;
  fee: number;
  feeType: 'percentage' | 'flat' | 'hourly';
  candidatesSubmitted: number;
  candidatesInterviewed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  currentTitle: string;
  currentCompany?: string;
  currentSalary?: number;
  desiredSalary?: number;
  location: string;
  openToRemote: boolean;
  openToRelocation: boolean;
  availability: 'immediate' | '2-weeks' | '1-month' | '2-months' | '3-months+';
  skills: string[];
  experience: number; // years
  education: EducationRecord[];
  workHistory: WorkExperience[];
  status: 'sourced' | 'contacted' | 'interested' | 'screening' | 'available' | 'interviewing' | 'placed' | 'not-interested';
  source: 'linkedin' | 'referral' | 'github' | 'stackoverflow' | 'job-board' | 'cold-outreach' | 'inbound';
  notes?: string;
  tags: string[];
  lastContactDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EducationRecord {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  gpa?: number;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  technologies?: string[];
  achievements?: string[];
}

export interface CandidateSubmission {
  id: string;
  candidateId: string;
  jobId: string;
  submittedAt: Date;
  status: 'submitted' | 'reviewed' | 'phone-screen' | 'technical-interview' | 'final-interview' | 'offer' | 'hired' | 'rejected';
  clientFeedback?: string;
  interviewNotes?: InterviewNote[];
  offerDetails?: OfferDetails;
  rejectionReason?: string;
  placementFee?: number;
  startDate?: Date;
}

export interface InterviewNote {
  id: string;
  interviewType: 'phone' | 'video' | 'technical' | 'behavioral' | 'final';
  interviewer: string;
  date: Date;
  rating: number; // 1-5
  notes: string;
  strengths: string[];
  concerns: string[];
  recommendation: 'strong-yes' | 'yes' | 'maybe' | 'no' | 'strong-no';
}

export interface OfferDetails {
  salary: number;
  equity?: number;
  bonus?: number;
  benefits: string[];
  startDate: Date;
  offerDate: Date;
  responseDeadline: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterOffer?: {
    salary?: number;
    equity?: number;
    startDate?: Date;
    notes?: string;
  };
}

export interface OutreachTemplate {
  id: string;
  name: string;
  type: 'candidate-cold' | 'candidate-warm' | 'client-intro' | 'client-follow-up' | 'referral-request';
  subject?: string;
  content: string;
  variables: string[];
  useCase: string;
  responseRate?: number;
  industry?: string;
  role?: string;
}

export interface NetworkContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  title: string;
  linkedinUrl?: string;
  relationship: 'colleague' | 'client' | 'candidate' | 'vendor' | 'friend' | 'acquaintance';
  strength: 'weak' | 'medium' | 'strong';
  lastContact: Date;
  canProvideReferrals: boolean;
  industries: string[];
  skills: string[];
  notes?: string;
  tags: string[];
}

export interface RecruitingMetrics {
  totalClients: number;
  activeJobs: number;
  candidatesInPipeline: number;
  placementsMTD: number;
  placementsYTD: number;
  revenueMTD: number;
  revenueYTD: number;
  averageTimeToFill: number;
  averageFee: number;
  submissionToHireRatio: number;
  candidateResponseRate: number;
  clientSatisfactionScore: number;
}

export interface RecruitingKnowledgeBase {
  id: string;
  category: 'best-practices' | 'market-data' | 'interview-guides' | 'salary-data' | 'industry-insights';
  title: string;
  content: string;
  tags: string[];
  lastUpdated: Date;
}

export interface SalaryData {
  role: string;
  level: string;
  location: string;
  min: number;
  max: number;
  median: number;
  source: string;
  lastUpdated: Date;
}
