// Client Portal Types

export interface ClientPortalAccess {
  clientId: string;
  accessToken: string;
  expiresAt: Date;
}

export interface JobRequisitionWithCandidates {
  id: string;
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  type: string;
  status: string;
  priority: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  benefits: string[];
  startDate: Date | null;
  targetFillDate: Date | null;
  filledDate: Date | null;
  numberOfPositions: number;
  positionsFilled: number;
  createdAt: Date;
  updatedAt: Date;
  applications: CandidateApplication[];
  clientFeedback: ClientFeedback[];
}

export interface CandidateApplication {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  status: string;
  stage: string | null;
  score: number | null;
  appliedDate: Date;
  lastActivity: Date;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    location: string | null;
    currentRole: string | null;
    experience: string | null;
    education: string | null;
    skills: string[];
    rating: number | null;
    resumeUrl: string | null;
    linkedInUrl: string | null;
    portfolioUrl: string | null;
  };
  interviews: Interview[];
}

export interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt: Date;
  duration: number | null;
  interviewer: string | null;
  notes: string | null;
  score: number | null;
  feedback: string | null;
}

export interface ClientFeedback {
  id: string;
  candidateId: string;
  candidateName: string;
  rating: number | null;
  status: string;
  comments: string | null;
  strengths: string[];
  concerns: string[];
  moveForward: boolean | null;
  interviewRequested: boolean;
  preferredInterviewDates: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPortalStats {
  totalRequisitions: number;
  openRequisitions: number;
  filledRequisitions: number;
  totalCandidates: number;
  candidatesInReview: number;
  interviewsScheduled: number;
  offersExtended: number;
  avgTimeToFill: number | null;
}

export interface PipelineStage {
  stage: string;
  count: number;
  candidates: CandidateApplication[];
}

export interface RequisitionPipeline {
  requisitionId: string;
  requisitionTitle: string;
  stages: PipelineStage[];
  totalCandidates: number;
  conversionRate: number;
}

export type CandidateFeedbackStatus = 
  | 'pending' 
  | 'interested' 
  | 'not-interested' 
  | 'interview-requested' 
  | 'rejected';

export type RequisitionStatus = 
  | 'open' 
  | 'on-hold' 
  | 'filled' 
  | 'cancelled';

export type RequisitionPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'urgent';
