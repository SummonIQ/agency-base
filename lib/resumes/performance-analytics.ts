import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';
import { subDays, startOfDay, endOfDay, differenceInDays } from 'date-fns';

export interface ResumeKeywordAnalysis {
  keyword: string;
  frequency: number;
  applicationCount: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  effectiveness: 'high' | 'medium' | 'low';
}

export interface ResumeSectionAnalysis {
  section: string;
  wordCount: number;
  keywordDensity: number;
  applicationCount: number;
  successRate: number;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface OptimizationImpact {
  beforeOptimization: {
    atsScore: number;
    responseRate: number;
    interviewRate: number;
    applicationCount: number;
  };
  afterOptimization: {
    atsScore: number;
    responseRate: number;
    interviewRate: number;
    applicationCount: number;
  };
  improvement: {
    atsScoreChange: number;
    responseRateChange: number;
    interviewRateChange: number;
    percentageImprovement: number;
  };
}

export interface ResumeCorrelationAnalysis {
  resumeId: string;
  resumeName: string;
  correlations: {
    atsScoreToResponseRate: number;
    atsScoreToInterviewRate: number;
    lengthToResponseRate: number;
    keywordCountToSuccessRate: number;
    optimizationScoreToOfferRate: number;
  };
  insights: string[];
}

/**
 * Analyze keyword effectiveness across resume applications
 */
export async function analyzeKeywordEffectiveness(
  userId: string,
  resumeId: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ResumeKeywordAnalysis[]> {
  // Get resume content and applications
  const resume = await db.resume.findUnique({
    where: { id: resumeId, userId },
    include: {
      analysis: true,
      applicationSubmissions: {
        where: dateRange ? {
          createdAt: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        } : undefined,
        include: {
          jobLead: {
            include: {
              jobListing: true,
            },
          },
        },
      },
    },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  // Extract keywords from resume
  const keywords = extractKeywords(resume.markdown || '');
  const keywordAnalysis: ResumeKeywordAnalysis[] = [];

  for (const keyword of keywords) {
    // Find applications where this keyword appeared in the job listing
    const relevantApplications = resume.applicationSubmissions.filter(app => {
      const jobDescription = app.jobLead.jobListing?.description || '';
      const jobTitle = app.jobLead.jobListing?.title || '';
      const combined = `${jobTitle} ${jobDescription}`.toLowerCase();
      return combined.includes(keyword.toLowerCase());
    });

    const totalApplications = relevantApplications.length;
    if (totalApplications === 0) continue;

    const responses = relevantApplications.filter(app => 
      app.responseReceivedAt !== null
    );
    const interviews = relevantApplications.filter(app => 
      app.interviewCount > 0
    );
    const offers = relevantApplications.filter(app => 
      [ApplicationStatus.OFFER_RECEIVED, ApplicationStatus.OFFER_ACCEPTED].includes(app.status)
    );

    const responseRate = (responses.length / totalApplications) * 100;
    const interviewRate = (interviews.length / totalApplications) * 100;
    const offerRate = (offers.length / totalApplications) * 100;

    let effectiveness: 'high' | 'medium' | 'low' = 'low';
    if (responseRate >= 30 && interviewRate >= 15) {
      effectiveness = 'high';
    } else if (responseRate >= 20 || interviewRate >= 10) {
      effectiveness = 'medium';
    }

    keywordAnalysis.push({
      keyword,
      frequency: countKeywordFrequency(resume.markdown || '', keyword),
      applicationCount: totalApplications,
      responseRate,
      interviewRate,
      offerRate,
      effectiveness,
    });
  }

  return keywordAnalysis.sort((a, b) => b.responseRate - a.responseRate);
}

/**
 * Analyze resume section effectiveness
 */
export async function analyzeResumeSections(
  userId: string,
  resumeId: string
): Promise<ResumeSectionAnalysis[]> {
  const resume = await db.resume.findUnique({
    where: { id: resumeId, userId },
    include: {
      applicationSubmissions: true,
    },
  });

  if (!resume || !resume.json) {
    throw new Error('Resume not found or missing content');
  }

  const resumeData = resume.json as any;
  const sections = [
    { name: 'Summary', content: resumeData.summary || '' },
    { name: 'Experience', content: JSON.stringify(resumeData.experience || []) },
    { name: 'Education', content: JSON.stringify(resumeData.education || []) },
    { name: 'Skills', content: JSON.stringify(resumeData.skills || []) },
    { name: 'Projects', content: JSON.stringify(resumeData.projects || []) },
  ];

  const sectionAnalysis: ResumeSectionAnalysis[] = [];
  const totalApplications = resume.applicationSubmissions.length;
  const successfulApplications = resume.applicationSubmissions.filter(app =>
    [ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.INTERVIEW_COMPLETED,
     ApplicationStatus.OFFER_RECEIVED, ApplicationStatus.OFFER_ACCEPTED].includes(app.status)
  ).length;
  const baseSuccessRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;

  for (const section of sections) {
    const wordCount = section.content.split(/\s+/).length;
    const keywords = extractKeywords(section.content);
    const keywordDensity = keywords.length / Math.max(wordCount, 1);

    // Determine impact based on section presence and content
    let impact: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (wordCount > 50 && keywordDensity > 0.1) {
      impact = 'positive';
    } else if (wordCount < 20) {
      impact = 'negative';
    }

    sectionAnalysis.push({
      section: section.name,
      wordCount,
      keywordDensity,
      applicationCount: totalApplications,
      successRate: baseSuccessRate,
      impact,
    });
  }

  return sectionAnalysis;
}

/**
 * Measure optimization impact by comparing before/after metrics
 */
export async function measureOptimizationImpact(
  userId: string,
  resumeId: string,
  optimizationDate: Date
): Promise<OptimizationImpact> {
  // Get applications before optimization
  const beforeApplications = await db.applicationSubmission.findMany({
    where: {
      userId,
      resumeId,
      createdAt: {
        lt: optimizationDate,
      },
    },
  });

  // Get applications after optimization
  const afterApplications = await db.applicationSubmission.findMany({
    where: {
      userId,
      resumeId,
      createdAt: {
        gte: optimizationDate,
      },
    },
  });

  // Get ATS scores
  const beforeAnalysis = await db.resumeAnalysis.findFirst({
    where: {
      resumeId,
      createdAt: {
        lt: optimizationDate,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const afterAnalysis = await db.resumeAnalysis.findFirst({
    where: {
      resumeId,
      createdAt: {
        gte: optimizationDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Calculate metrics
  const calculateMetrics = (applications: any[]) => {
    const total = applications.length;
    if (total === 0) {
      return { responseRate: 0, interviewRate: 0 };
    }

    const responses = applications.filter(app => app.responseReceivedAt).length;
    const interviews = applications.filter(app => app.interviewCount > 0).length;

    return {
      responseRate: (responses / total) * 100,
      interviewRate: (interviews / total) * 100,
    };
  };

  const beforeMetrics = calculateMetrics(beforeApplications);
  const afterMetrics = calculateMetrics(afterApplications);

  const beforeAtsScore = beforeAnalysis?.score || 0;
  const afterAtsScore = afterAnalysis?.score || 0;

  const atsScoreChange = afterAtsScore - beforeAtsScore;
  const responseRateChange = afterMetrics.responseRate - beforeMetrics.responseRate;
  const interviewRateChange = afterMetrics.interviewRate - beforeMetrics.interviewRate;

  const percentageImprovement = beforeAtsScore > 0
    ? ((afterAtsScore - beforeAtsScore) / beforeAtsScore) * 100
    : 0;

  return {
    beforeOptimization: {
      atsScore: beforeAtsScore,
      responseRate: beforeMetrics.responseRate,
      interviewRate: beforeMetrics.interviewRate,
      applicationCount: beforeApplications.length,
    },
    afterOptimization: {
      atsScore: afterAtsScore,
      responseRate: afterMetrics.responseRate,
      interviewRate: afterMetrics.interviewRate,
      applicationCount: afterApplications.length,
    },
    improvement: {
      atsScoreChange,
      responseRateChange,
      interviewRateChange,
      percentageImprovement,
    },
  };
}

/**
 * Analyze correlations between resume attributes and success metrics
 */
export async function analyzeResumeCorrelations(
  userId: string,
  resumeId: string
): Promise<ResumeCorrelationAnalysis> {
  const resume = await db.resume.findUnique({
    where: { id: resumeId, userId },
    include: {
      analysis: true,
      optimization: true,
      applicationSubmissions: true,
    },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  // Calculate various correlations
  const applications = resume.applicationSubmissions;
  const atsScore = resume.analysis?.score || 0;
  const optimizationScore = resume.optimization?.score || 0;
  
  // Simple correlation calculations (would use proper statistical methods in production)
  const responseRate = applications.filter(a => a.responseReceivedAt).length / Math.max(applications.length, 1);
  const interviewRate = applications.filter(a => a.interviewCount > 0).length / Math.max(applications.length, 1);
  const offerRate = applications.filter(a => 
    [ApplicationStatus.OFFER_RECEIVED, ApplicationStatus.OFFER_ACCEPTED].includes(a.status)
  ).length / Math.max(applications.length, 1);

  // Calculate word count
  const wordCount = (resume.markdown || '').split(/\s+/).length;
  const keywordCount = extractKeywords(resume.markdown || '').length;

  // Simple correlation coefficients (normalized to -1 to 1 range)
  const correlations = {
    atsScoreToResponseRate: normalizeCorrelation(atsScore, responseRate * 100),
    atsScoreToInterviewRate: normalizeCorrelation(atsScore, interviewRate * 100),
    lengthToResponseRate: normalizeCorrelation(wordCount / 100, responseRate * 100),
    keywordCountToSuccessRate: normalizeCorrelation(keywordCount, (responseRate + interviewRate + offerRate) * 33.33),
    optimizationScoreToOfferRate: normalizeCorrelation(optimizationScore || 0, offerRate * 100),
  };

  // Generate insights based on correlations
  const insights: string[] = [];
  
  if (correlations.atsScoreToResponseRate > 0.5) {
    insights.push('Higher ATS scores strongly correlate with better response rates');
  }
  if (correlations.lengthToResponseRate < -0.3) {
    insights.push('Shorter resumes tend to perform better for this profile');
  }
  if (correlations.keywordCountToSuccessRate > 0.4) {
    insights.push('Keyword optimization shows positive impact on success rates');
  }
  if (atsScore < 70) {
    insights.push('ATS score is below optimal range - consider optimization');
  }
  if (wordCount > 800) {
    insights.push('Resume length exceeds recommended range - consider condensing');
  }

  return {
    resumeId,
    resumeName: resume.name,
    correlations,
    insights,
  };
}

/**
 * Store performance metrics in database
 */
export async function storePerformanceMetrics(
  userId: string,
  resumeId: string,
  metrics: Partial<ResumePerformanceMetrics>
): Promise<void> {
  const existingMetric = await db.resumePerformanceMetric.findFirst({
    where: {
      userId,
      resumeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const data = {
    userId,
    resumeId,
    ...metrics,
    calculatedAt: new Date(),
  };

  if (existingMetric) {
    // Update existing metric
    await db.resumePerformanceMetric.update({
      where: { id: existingMetric.id },
      data,
    });
  } else {
    // Create new metric
    await db.resumePerformanceMetric.create({
      data,
    });
  }
}

// Helper functions
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'shall', 'i', 'you', 'he', 'she',
    'it', 'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Get unique keywords
  const keywordSet = new Set(words);
  
  // Filter for technical/professional keywords
  return Array.from(keywordSet).filter(keyword => {
    // Keep technical terms, skills, and professional words
    return /^[a-z]+[\w]*$/.test(keyword) && keyword.length > 3;
  }).slice(0, 50); // Limit to top 50 keywords
}

function countKeywordFrequency(text: string, keyword: string): number {
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function normalizeCorrelation(value1: number, value2: number): number {
  // Simple normalization - in production would use proper correlation coefficient
  const max = Math.max(value1, value2);
  if (max === 0) return 0;
  
  const normalized = Math.min(value1, value2) / max;
  return Math.max(-1, Math.min(1, normalized));
}

// Type definition for compatibility
interface ResumePerformanceMetrics {
  totalApplications: number;
  totalResponses: number;
  totalInterviews: number;
  totalOffers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  atsScore?: number;
  optimizationScore?: number;
  avgResponseTime?: number;
  avgInterviewTime?: number;
  avgOfferTime?: number;
  keywordEffectiveness?: any;
  sectionEffectiveness?: any;
  personalBest?: boolean;
  improvementFromPrevious?: number;
}