import { openai } from '@/lib/ai';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';
import { AppError, ErrorCode } from '@/lib/errors';

export interface Skill {
  name: string;
  type: 'technical' | 'soft' | 'domain';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  relevance: number; // 1-10 scale
  description?: string;
}

export interface SkillGapAnalysis {
  id: string;
  jobLeadId?: string;
  resumeId?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  
  matchedSkills: Skill[];
  missingSkills: Skill[];
  partialSkills: Skill[];
  overallMatch: number; // percentage
  
  recommendations: {
    skillsToAcquire: string[];
    skillsToImprove: string[];
    skillsToHighlight: string[];
    coursesAndResources: Array<{
      skill: string;
      resources: Array<{
        name: string;
        url?: string;
        type: 'course' | 'certification' | 'tutorial' | 'book' | 'practice';
        platform?: string;
        estimatedTimeHours?: number;
        description?: string;
      }>;
    }>;
  };
  
  summary: string;
}

export interface SkillGapAnalysisOptions {
  jobLeadId?: string;
  resumeId?: string;
  jobTitle?: string;
  jobDescription?: string;
  resumeText?: string;
}

/**
 * Analyze the gap between a user's skills (from resume) and job requirements
 */
export async function analyzeSkillGap(
  options: SkillGapAnalysisOptions
): Promise<SkillGapAnalysis> {
  const user = await getCurrentUser();
  
  let jobLead;
  let resume;
  let jobTitle = options.jobTitle;
  let jobDescription = options.jobDescription;
  let resumeText = options.resumeText;
  
  // Fetch job lead if provided
  if (options.jobLeadId) {
    jobLead = await db.jobLead.findUnique({
      where: {
        id: options.jobLeadId,
        userId: user.id,
      },
      include: {
        jobListing: true,
      },
    });
    
    if (!jobLead) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: `Job lead with ID ${options.jobLeadId} not found`,
      });
    }
    
    jobTitle = jobLead.jobListing.title;
    jobDescription = jobLead.jobListing.description || '';
  }
  
  // Fetch resume if provided
  if (options.resumeId) {
    resume = await db.resume.findUnique({
      where: {
        id: options.resumeId,
        userId: user.id,
      },
      include: {
        revisions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!resume) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: `Resume with ID ${options.resumeId} not found`,
      });
    }
    
    // Get resume text from either markdown, JSON, or revision
    if (resume.markdown) {
      resumeText = resume.markdown;
    } else if (resume.json) {
      // Convert JSON to plain text if needed
      resumeText = JSON.stringify(resume.json);
    } else if (resume.revisions?.[0]?.markdown) {
      resumeText = resume.revisions[0].markdown;
    }
  }
  
  if (!jobDescription || !resumeText) {
    throw new AppError({
      code: ErrorCode.INVALID_INPUT,
      message: 'Job description and resume text are required for skill gap analysis',
    });
  }
  
  // Generate AI analysis
  const analysis = await generateSkillGapAnalysis(jobTitle || 'Unknown Position', jobDescription, resumeText);
  
  // Save to database
  const savedAnalysis = await db.skillGapAnalysis.create({
    data: {
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      partialSkills: analysis.partialSkills,
      overallMatch: analysis.overallMatch,
      recommendations: analysis.recommendations,
      summary: analysis.summary,
      jobLeadId: options.jobLeadId,
      resumeId: options.resumeId,
      userId: user.id,
    },
  });
  
  return {
    ...analysis,
    id: savedAnalysis.id,
    createdAt: savedAnalysis.createdAt,
    updatedAt: savedAnalysis.updatedAt,
    userId: user.id,
    jobLeadId: options.jobLeadId,
    resumeId: options.resumeId,
  };
}

/**
 * Use AI to generate skill gap analysis
 */
async function generateSkillGapAnalysis(
  jobTitle: string,
  jobDescription: string,
  resumeText: string
): Promise<Omit<SkillGapAnalysis, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'jobLeadId' | 'resumeId'>> {
  const prompt = createSkillGapPrompt(jobTitle, jobDescription, resumeText);
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor and skills analyst specializing in identifying skill gaps between a candidate\'s resume and job requirements. Provide detailed, actionable, and objective analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Empty response from AI');
    }
    
    const parsedResponse = JSON.parse(responseContent);
    
    // Validate the response structure
    if (!parsedResponse.matchedSkills || !parsedResponse.missingSkills || !parsedResponse.partialSkills || !parsedResponse.overallMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    return {
      matchedSkills: parsedResponse.matchedSkills,
      missingSkills: parsedResponse.missingSkills,
      partialSkills: parsedResponse.partialSkills,
      overallMatch: parsedResponse.overallMatch,
      recommendations: parsedResponse.recommendations,
      summary: parsedResponse.summary,
    };
  } catch (error) {
    console.error('Error generating skill gap analysis:', error);
    throw new AppError({
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'Failed to generate skill gap analysis',
      cause: error,
    });
  }
}

/**
 * Create a prompt for the AI to generate skill gap analysis
 */
function createSkillGapPrompt(
  jobTitle: string,
  jobDescription: string,
  resumeText: string
): string {
  return `I need a detailed skill gap analysis comparing a resume to a job description.

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Resume:
${resumeText}

Please analyze the gap between the candidate's skills (from resume) and the job requirements.

Return the results in this JSON format:
{
  "matchedSkills": [
    {
      "name": "skill name",
      "type": "technical|soft|domain", 
      "level": "beginner|intermediate|advanced|expert",
      "relevance": 1-10,
      "description": "brief description"
    }
  ],
  "missingSkills": [
    {
      "name": "skill name",
      "type": "technical|soft|domain",
      "relevance": 1-10,
      "description": "why this skill is important for the role"
    }
  ],
  "partialSkills": [
    {
      "name": "skill name",
      "type": "technical|soft|domain",
      "level": "beginner|intermediate|advanced|expert",
      "relevance": 1-10,
      "description": "what aspects need improvement"
    }
  ],
  "overallMatch": percentage (0-100),
  "recommendations": {
    "skillsToAcquire": ["skill1", "skill2"],
    "skillsToImprove": ["skill3", "skill4"],
    "skillsToHighlight": ["skill5", "skill6"],
    "coursesAndResources": [
      {
        "skill": "skill name",
        "resources": [
          {
            "name": "resource name",
            "url": "optional url",
            "type": "course|certification|tutorial|book|practice",
            "platform": "optional platform name",
            "estimatedTimeHours": optional number,
            "description": "brief description"
          }
        ]
      }
    ]
  },
  "summary": "concise summary of the skill gap analysis with key insights and recommendations (3-4 paragraphs)"
}`;
}

/**
 * Get skill gap analysis by ID
 */
export async function getSkillGapAnalysis(id: string): Promise<SkillGapAnalysis> {
  const user = await getCurrentUser();
  
  const analysis = await db.skillGapAnalysis.findUnique({
    where: {
      id,
      userId: user.id,
    },
    include: {
      jobLead: {
        include: {
          jobListing: true,
        },
      },
      resume: true,
    },
  });
  
  if (!analysis) {
    throw new AppError({
      code: ErrorCode.NOT_FOUND,
      message: `Skill gap analysis with ID ${id} not found`,
    });
  }
  
  return {
    id: analysis.id,
    jobLeadId: analysis.jobLeadId || undefined,
    resumeId: analysis.resumeId || undefined,
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,
    userId: analysis.userId,
    matchedSkills: analysis.matchedSkills as Skill[],
    missingSkills: analysis.missingSkills as Skill[],
    partialSkills: analysis.partialSkills as Skill[],
    overallMatch: analysis.overallMatch,
    recommendations: analysis.recommendations as any,
    summary: analysis.summary,
  };
}

/**
 * Get all skill gap analyses for the current user
 */
export async function getAllSkillGapAnalyses(): Promise<SkillGapAnalysis[]> {
  const user = await getCurrentUser();
  
  const analyses = await db.skillGapAnalysis.findMany({
    where: {
      userId: user.id,
    },
    include: {
      jobLead: {
        include: {
          jobListing: true,
        },
      },
      resume: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return analyses.map(analysis => ({
    id: analysis.id,
    jobLeadId: analysis.jobLeadId || undefined,
    resumeId: analysis.resumeId || undefined,
    createdAt: analysis.createdAt,
    updatedAt: analysis.updatedAt,
    userId: analysis.userId,
    matchedSkills: analysis.matchedSkills as Skill[],
    missingSkills: analysis.missingSkills as Skill[],
    partialSkills: analysis.partialSkills as Skill[],
    overallMatch: analysis.overallMatch,
    recommendations: analysis.recommendations as any,
    summary: analysis.summary,
  }));
}
