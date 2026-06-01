import { openai } from '@ai-sdk/openai';
import { JobFitAnalysisStatus, type Prisma } from '@prisma/client';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createAIServiceError } from '@/lib/errors';

import { db } from '@/lib/db';

export type JobFitAnalysisResult = {
  additional_metrics: Record<string, unknown>;
  education_relevance_score: number;
  experience_relevance_score: number;
  fit_summary: string;
  keyword_match: {
    match_percentage: number;
    matched_keywords: string[];
  };
  missing_keywords: string[];
  overall_match_score: number;
  recommendations: string[];
  skills_alignment: {
    alignment_score: number;
    skills: string[];
  };
};

/**
 * Calls the AI logic to analyze the job fit between a resume and a job description.
 */
export async function analyzeJobFit({
  resumeMarkdown,
  jobDescription,
}: {
  jobDescription: string;
  resumeMarkdown: string;
}): Promise<JobFitAnalysisResult> {
  const prompt = `
  You are an expert in resume writing, ATS optimization, and job fit analysis.
  
  Analyze the following resume (in Markdown format) and job description.
  Evaluate how well the resume fits the job description by providing a comprehensive analysis that includes useful metrics and actionable insights.
  
  Consider the following aspects in your analysis:
  1. Overall Match Score: A percentage (0-100) indicating the overall compatibility.
  2. Keyword Match: Identify keywords from the job description that appear in the resume and calculate the percentage of matched keywords.
  3. Missing Keywords: List keywords present in the job description that are missing in the resume.
  4. Skills Alignment: Evaluate the candidate’s skills relative to the job requirements, including a score (0-100) and a list of relevant skills.
  5. Experience Relevance: Provide a score (0-100) indicating how relevant the candidate's experience is to the job.
  6. Education Relevance: Provide a score (0-100) indicating how well the candidate's education matches the job requirements.
  7. Recommendations: Offer actionable suggestions for improving the resume to better match the job.
  8. Fit Summary: Summarize the overall job fit.
  9. Additional Metrics: Include any other metrics or insights that might be useful.
  
  Provide your response strictly in JSON format following this schema:
  \`\`\`{
    "overall_match_score": "number",
    "keyword_match": {
      "matched_keywords": ["string"],
      "match_percentage": "number"
    },
    "missing_keywords": ["string"],
    "skills_alignment": {
      "skills": ["string"],
      "alignment_score": "number"
    },
    "experience_relevance_score": "number",
    "education_relevance_score": "number",
    "recommendations": ["string"],
    "fit_summary": "string",
    "additional_metrics": {}
  }
  \`\`\`
  Resume:
  ${resumeMarkdown}
  
  Job Description:
  ${jobDescription}
  
  Do not include any other text in the response. Including things like '\`\`\`json\`\`\` or "\`\`\`'
  `;

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt,
    schema: z.object({
      additional_metrics: z.object({}),
      education_relevance_score: z.number(),
      experience_relevance_score: z.number(),
      fit_summary: z.string(),
      keyword_match: z.object({
        match_percentage: z.number(),
        matched_keywords: z.array(z.string()),
      }),
      missing_keywords: z.array(z.string()),
      overall_match_score: z.number(),
      recommendations: z.array(z.string()),
      skills_alignment: z.object({
        alignment_score: z.number(),
        skills: z.array(z.string()),
      }),
    }),
  });

  // Parse and return the analysis data
  return object;
}

/**
 * Generates a job fit analysis for a given job lead, then saves it in the database.
 */
export async function createJobFitAnalysis({
  jobLeadId,
  resumeMarkdown,
  jobDescription,
}: {
  jobDescription: string;
  jobLeadId: string;
  resumeMarkdown: string;
}) {
  try {
    // 1. Run the AI-powered analysis.
    const analysis = await analyzeJobFit({ jobDescription, resumeMarkdown });

    // 2. Save the analysis into the JobFitAnalysis table.
    const savedAnalysis = await db.jobFitAnalysis.create({
      data: {
        additionalMetrics: analysis.additional_metrics as Prisma.InputJsonValue,
        educationRelevanceScore: analysis.education_relevance_score,
        experienceRelevanceScore: analysis.experience_relevance_score,
        jobLead: { connect: { id: jobLeadId } },
        keywordMatch: analysis.keyword_match,
        missingKeywords: analysis.missing_keywords,
        overallMatchScore: analysis.overall_match_score,
        recommendations: analysis.recommendations,
        skillsAlignment: analysis.skills_alignment,
        status: JobFitAnalysisStatus.COMPLETED,
        summary: analysis.fit_summary,
      },
    });

    return savedAnalysis;
  } catch (error) {
    throw createAIServiceError(error, {
      jobLeadId,
      operation: 'createJobFitAnalysis',
      hasResumeMarkdown: !!resumeMarkdown,
      hasJobDescription: !!jobDescription,
    });
  }
}
