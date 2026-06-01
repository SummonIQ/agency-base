import { db } from '@/lib/db';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  experience?: string;
  education?: string;
  skills: string[];
  status: 'new' | 'active' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  rating?: number;
  resumeUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  customFields?: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    applications: number;
    interviews: number;
    notes: number;
  };
}

export interface JobApplication {
  id: string;
  position: string;
  company: string;
  department?: string;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  stage?: string;
  salary?: string;
  location?: string;
  type?: string;
  score?: number;
  appliedDate: Date;
  lastActivity: Date;
  candidateId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  candidate?: Candidate;
  _count?: {
    interviews: number;
    notes: number;
  };
}

export interface TalentPool {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  qualityScore?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    candidates: number;
  };
}

export interface Interview {
  id: string;
  type: 'phone' | 'video' | 'onsite' | 'technical';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledAt: Date;
  duration?: number;
  interviewer?: string;
  notes?: string;
  score?: number;
  feedback?: string;
  candidateId: string;
  applicationId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  candidate?: Candidate;
  application?: JobApplication;
}

export interface RecruitingStats {
  totalCandidates: number;
  activeCandidates: number;
  totalApplications: number;
  activeApplications: number;
  totalTalentPools: number;
  upcomingInterviews: number;
  avgCandidateRating: number;
  applicationsByStatus: Record<string, number>;
  candidatesByStatus: Record<string, number>;
  interviewsByType: Record<string, number>;
}

export class RecruitingService {
  // Candidate Management
  async createCandidate(data: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    currentRole?: string;
    experience?: string;
    education?: string;
    skills?: string[];
    rating?: number;
    resumeUrl?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    customFields?: any;
    userId: string;
  }): Promise<Candidate> {
    return await db.candidate.create({
      data: {
        ...data,
        skills: data.skills || [],
      },
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            notes: true,
          },
        },
      },
    }) as Candidate;
  }

  async getCandidates(userId: string, filters?: {
    status?: string;
    skills?: string[];
    location?: string;
    rating?: number;
    search?: string;
    talentPoolId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Candidate[]> {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        hasSome: filters.skills,
      };
    }
    
    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }
    
    if (filters?.rating) {
      where.rating = {
        gte: filters.rating,
      };
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { currentRole: { contains: filters.search, mode: 'insensitive' } },
        { skills: { hasSome: [filters.search] } },
      ];
    }

    if (filters?.talentPoolId) {
      where.talentPools = {
        some: { talentPoolId: filters.talentPoolId },
      };
    }

    return await db.candidate.findMany({
      where,
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            notes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }) as Candidate[];
  }

  async getCandidate(candidateId: string, userId: string): Promise<Candidate | null> {
    return await db.candidate.findFirst({
      where: { id: candidateId, userId },
      include: {
        applications: {
          include: {
            _count: {
              select: {
                interviews: true,
                notes: true,
              },
            },
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            applications: true,
            interviews: true,
            notes: true,
          },
        },
      },
    }) as Candidate | null;
  }

  async updateCandidate(candidateId: string, userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    currentRole?: string;
    experience?: string;
    education?: string;
    skills?: string[];
    status?: 'new' | 'active' | 'interviewing' | 'offered' | 'hired' | 'rejected';
    rating?: number;
    resumeUrl?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    customFields?: any;
  }): Promise<Candidate> {
    return await db.candidate.update({
      where: { id: candidateId },
      data,
      include: {
        _count: {
          select: {
            applications: true,
            interviews: true,
            notes: true,
          },
        },
      },
    }) as Candidate;
  }

  async deleteCandidate(candidateId: string, userId: string): Promise<void> {
    await db.candidate.deleteMany({
      where: { id: candidateId, userId },
    });
  }

  // Job Application Management
  async createApplication(data: {
    position: string;
    company: string;
    department?: string;
    salary?: string;
    location?: string;
    type?: string;
    candidateId: string;
    userId: string;
  }): Promise<JobApplication> {
    return await db.jobApplication.create({
      data,
      include: {
        candidate: true,
        _count: {
          select: {
            interviews: true,
            notes: true,
          },
        },
      },
    }) as JobApplication;
  }

  async getApplications(userId: string, filters?: {
    status?: string;
    candidateId?: string;
    company?: string;
    position?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<JobApplication[]> {
    const where: any = { userId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.candidateId) {
      where.candidateId = filters.candidateId;
    }
    
    if (filters?.company) {
      where.company = {
        contains: filters.company,
        mode: 'insensitive',
      };
    }
    
    if (filters?.position) {
      where.position = {
        contains: filters.position,
        mode: 'insensitive',
      };
    }
    
    if (filters?.search) {
      where.OR = [
        { position: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
        { department: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await db.jobApplication.findMany({
      where,
      include: {
        candidate: true,
        _count: {
          select: {
            interviews: true,
            notes: true,
          },
        },
      },
      orderBy: { lastActivity: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }) as JobApplication[];
  }

  async updateApplication(applicationId: string, userId: string, data: {
    status?: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
    stage?: string;
    salary?: string;
    score?: number;
  }): Promise<JobApplication> {
    return await db.jobApplication.update({
      where: { id: applicationId },
      data: {
        ...data,
        lastActivity: new Date(),
      },
      include: {
        candidate: true,
        _count: {
          select: {
            interviews: true,
            notes: true,
          },
        },
      },
    }) as JobApplication;
  }

  // Talent Pool Management
  async createTalentPool(data: {
    name: string;
    description?: string;
    category: string;
    tags?: string[];
    userId: string;
  }): Promise<TalentPool> {
    return await db.talentPool.create({
      data: {
        ...data,
        tags: data.tags || [],
      },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    }) as TalentPool;
  }

  async getTalentPools(userId: string): Promise<TalentPool[]> {
    return await db.talentPool.findMany({
      where: { userId },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as TalentPool[];
  }

  async addCandidateToTalentPool(talentPoolId: string, candidateId: string, notes?: string): Promise<void> {
    await db.talentPoolCandidate.create({
      data: {
        talentPoolId,
        candidateId,
        notes,
      },
    });
  }

  async removeCandidateFromTalentPool(talentPoolId: string, candidateId: string): Promise<void> {
    await db.talentPoolCandidate.deleteMany({
      where: { talentPoolId, candidateId },
    });
  }

  // Interview Management
  async createInterview(data: {
    type: 'phone' | 'video' | 'onsite' | 'technical';
    scheduledAt: Date;
    duration?: number;
    interviewer?: string;
    notes?: string;
    candidateId: string;
    applicationId?: string;
    userId: string;
  }): Promise<Interview> {
    return await db.interview.create({
      data,
      include: {
        candidate: true,
        application: true,
      },
    }) as Interview;
  }

  async getInterviews(userId: string, filters?: {
    candidateId?: string;
    applicationId?: string;
    status?: string;
    type?: string;
    upcoming?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Interview[]> {
    const where: any = { userId };
    
    if (filters?.candidateId) {
      where.candidateId = filters.candidateId;
    }
    
    if (filters?.applicationId) {
      where.applicationId = filters.applicationId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.type) {
      where.type = filters.type;
    }
    
    if (filters?.upcoming) {
      where.scheduledAt = {
        gte: new Date(),
      };
      where.status = 'scheduled';
    }

    return await db.interview.findMany({
      where,
      include: {
        candidate: true,
        application: true,
      },
      orderBy: { scheduledAt: filters?.upcoming ? 'asc' : 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }) as Interview[];
  }

  async updateInterview(interviewId: string, userId: string, data: {
    status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
    scheduledAt?: Date;
    duration?: number;
    interviewer?: string;
    notes?: string;
    score?: number;
    feedback?: string;
  }): Promise<Interview> {
    return await db.interview.update({
      where: { id: interviewId },
      data,
      include: {
        candidate: true,
        application: true,
      },
    }) as Interview;
  }

  // Notes Management
  async addCandidateNote(candidateId: string, userId: string, content: string, type?: string): Promise<void> {
    await db.candidateNote.create({
      data: {
        candidateId,
        userId,
        content,
        type,
      },
    });
  }

  async addApplicationNote(applicationId: string, userId: string, content: string, type?: string): Promise<void> {
    await db.applicationNote.create({
      data: {
        applicationId,
        userId,
        content,
        type,
      },
    });
  }

  // Analytics and Reporting
  async getRecruitingStats(userId: string): Promise<RecruitingStats> {
    const [
      totalCandidates,
      activeCandidates,
      totalApplications,
      activeApplications,
      totalTalentPools,
      upcomingInterviews,
      candidateRatings,
      applicationsByStatus,
      candidatesByStatus,
      interviewsByType,
    ] = await Promise.all([
      db.candidate.count({ where: { userId } }),
      db.candidate.count({ where: { userId, status: 'active' } }),
      db.jobApplication.count({ where: { userId } }),
      db.jobApplication.count({ 
        where: { 
          userId, 
          status: { in: ['new', 'screening', 'interview'] } 
        } 
      }),
      db.talentPool.count({ where: { userId } }),
      db.interview.count({ 
        where: { 
          userId, 
          status: 'scheduled',
          scheduledAt: { gte: new Date() }
        } 
      }),
      db.candidate.findMany({
        where: { userId, rating: { not: null } },
        select: { rating: true },
      }),
      db.jobApplication.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      db.candidate.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      db.interview.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),
    ]);

    const avgCandidateRating = candidateRatings.length > 0
      ? candidateRatings.reduce((sum, c) => sum + (c.rating || 0), 0) / candidateRatings.length
      : 0;

    return {
      totalCandidates,
      activeCandidates,
      totalApplications,
      activeApplications,
      totalTalentPools,
      upcomingInterviews,
      avgCandidateRating,
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      candidatesByStatus: candidatesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>),
      interviewsByType: interviewsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Bulk Operations
  async importCandidates(userId: string, candidates: Array<{
    name: string;
    email: string;
    phone?: string;
    location?: string;
    currentRole?: string;
    skills?: string[];
    resumeUrl?: string;
    linkedInUrl?: string;
  }>): Promise<{ imported: number; skipped: number; errors: string[] }> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const candidateData of candidates) {
      try {
        // Check if candidate already exists
        const existing = await db.candidate.findFirst({
          where: { email: candidateData.email, userId },
        });

        if (existing) {
          skipped++;
          continue;
        }

        await this.createCandidate({
          ...candidateData,
          userId,
        });
        imported++;
      } catch (error) {
        errors.push(`Error importing ${candidateData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { imported, skipped, errors };
  }
}

export const recruitingService = new RecruitingService();
