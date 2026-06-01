'use server';

import {
  type Resume,
  ResumeAnalysisStatus,
  ResumeOptimizationStatus,
} from '@prisma/client';
import { after } from 'next/server';

import { revalidateTag } from '@/lib/cache';
import { db } from '@/lib/db';
import { convertWordDocumentToMarkdown } from '@/lib/files/convert';
import { logger } from '@/lib/logger';
import { analyzeResumeForATS } from '@/lib/resumes/analyze/ats';
import { refineMarkdown } from '@/lib/resumes/refine/markdown';
import { getCurrentUser } from '@/lib/user';
import { AppError, ErrorCode, createDatabaseError, createFileProcessingError, withErrorHandling } from '@/lib/errors';

// Helper function to validate URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
import { put } from '@vercel/blob';

import { getPrivateUserChannel } from '../events/channels';
import { sendResumeOptimizationProgress } from './events';
import { optimizeResume } from './optimize/optimize';
import { convertMarkdownToWord } from '../files/convert/markdown-to-word';
import { triggerResumeAnalysisNotification } from '@/lib/notifications/triggers';

export async function createUserResume({
  description,
  name,
  setDefault = false,
  url,
}: {
  description?: string;
  name: string;
  setDefault?: boolean;
  url: string;
}): Promise<Resume> {
  // Input validation
  if (!name || name.trim().length === 0) {
    throw new AppError({
      code: ErrorCode.INVALID_INPUT,
      message: 'Resume name is required',
      userMessage: 'Please provide a name for your resume.',
    });
  }

  if (!url || !isValidUrl(url)) {
    throw new AppError({
      code: ErrorCode.INVALID_INPUT,
      message: 'Valid resume URL is required',
      userMessage: 'Please provide a valid resume file URL.',
    });
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new AppError({
      code: ErrorCode.UNAUTHORIZED,
      message: 'User not authenticated',
      userMessage: 'Please log in to create a resume.',
    });
  }
  const userChannel = getPrivateUserChannel(user.id);

  logger.info('[RESUME_CREATE] Creating resume DB record', {
    description,
    name,
    url,
  });
  const userResume = await db.resume.create({
    data: {
      description,
      name,
      optimization: {
        create: {
          analysis: {
            create: {
              status: ResumeAnalysisStatus.ANALYZING,
              user: { connect: { id: user.id } },
            },
          },
          progress: 5,
          status: ResumeOptimizationStatus.PROCESSING,
          user: { connect: { id: user.id } },
        },
      },
      url,
      user: {
        connect: { id: user.id },
      },
    },
    include: {
      analysis: true,
      optimization: true,
    },
  });
  logger.info('[RESUME_CREATE] Created resume DB record', userResume);

  revalidateTag(`user:${user.id}:report:resumes`);
  revalidateTag(`user:${user.id}:resumes`);
  revalidateTag(`user:${user.id}:resumes:queued`);
  revalidateTag(`user:${user.id}:resumes:${userResume.id}`);

  sendResumeOptimizationProgress({
    id: userResume.id,
    name: userResume.name,
    progress: 5,
    status: ResumeOptimizationStatus.PROCESSING,
  });

  if (setDefault) {
    logger.info('[RESUME_CREATE] Updating default resume');
    await db.user.update({
      data: {
        defaultResumeId: userResume.id,
      },
      where: {
        id: user.id,
      },
    });

    revalidateTag(`user:${user.id}:resumes:default`);
    revalidateTag(`user:${user.id}:report:resumes`);
    revalidateTag(`user:${user.id}:resumes`);
    revalidateTag(`user:${user.id}:resumes:queued`);
    revalidateTag(`user:${user.id}:resumes:${userResume.id}`);

    logger.info('[RESUME_CREATE] Updated default resume');
  }

  logger.info('[RESUME_CREATE] Returning from createUserResume');
  after(async () => {
    logger.info('[RESUME_CREATE] Starting after');
    try {
      logger.info('[RESUME_CREATE] Updating resume optimization');
      await db.resumeOptimization.update({
        data: {
          progress: 30,
          resume: { connect: { id: userResume.id } },
          status: ResumeOptimizationStatus.REFINING,
          user: { connect: { id: user.id } },
        },
        where: { id: userResume.optimization?.id },
      });
      logger.info('[RESUME_CREATE] Updated resume optimization');

      revalidateTag(`user:${user.id}:resumes:default`);
      revalidateTag(`user:${user.id}:report:resumes`);
      revalidateTag(`user:${user.id}:resumes`);
      revalidateTag(`user:${user.id}:resumes:queued`);
      revalidateTag(`user:${user.id}:resumes:${userResume.id}`);

      sendResumeOptimizationProgress({
        id: userResume.id,
        name: userResume.name,
        progress: 30,
        status: ResumeOptimizationStatus.REFINING,
      });

      logger.info('[RESUME_CREATE] Fetching resume');
      const response = await fetch(url);
      logger.info('[RESUME_CREATE] Fetched resume');

      logger.info('[RESUME_CREATE] Converting word document to markdown');
      const arrayBuf = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const markdown = await convertWordDocumentToMarkdown(buffer);
      logger.info('[RESUME_CREATE] Converted word document to markdown');

      logger.info('[RESUME_CREATE] Refining markdown');
      const refinedMarkdown = await refineMarkdown(markdown);
      logger.info('[RESUME_CREATE] Refined markdown');

      logger.info('[RESUME_CREATE] Updating resume');
      await db.resume.update({
        data: {
          markdown: refinedMarkdown,
          optimization: {
            update: {
              progress: 55,
              status: ResumeOptimizationStatus.ANALYZING,
            },
          },
        },
        where: { id: userResume.id },
      });
      logger.info('[RESUME_CREATE] Updated resume');

      revalidateTag(`user:${user.id}:resumes:default`);
      revalidateTag(`user:${user.id}:report:resumes`);
      revalidateTag(`user:${user.id}:resumes`);
      revalidateTag(`user:${user.id}:resumes:queued`);
      revalidateTag(`user:${user.id}:resumes:${userResume.id}`);

      sendResumeOptimizationProgress({
        id: userResume.id,
        name: userResume.name,
        progress: 55,
        status: ResumeOptimizationStatus.ANALYZING,
      });

      logger.info('[RESUME_CREATE] Analyzing resume for ATS');
      const resumeATSAnalysis = await analyzeResumeForATS(refinedMarkdown);
      logger.info('[RESUME_CREATE] Analyzed resume for ATS');

      const { breakdown, recommendations, score, summary } = resumeATSAnalysis;
      const analysisId = userResume.optimization?.analysisId;

      if (!analysisId) {
        throw new Error('Analysis not found');
      }

      logger.info('[RESUME_CREATE] Updating resume analysis');
      const resumeAnalysis = await db.resumeAnalysis.update({
        data: {
          achievements: breakdown.achievements,
          formatting: breakdown.formatting,
          grammar: breakdown.grammar,
          keywords: breakdown.keywords,
          optimization: {
            update: {
              progress: 70,
              status: ResumeOptimizationStatus.OPTIMIZING,
            },
          },
          progress: 100,
          readability: breakdown.readability,
          recommendations,
          resume: { connect: { id: userResume.id } },
          score,
          sections: breakdown.sections,
          spelling: breakdown.spelling,
          status: ResumeAnalysisStatus.COMPLETED,
          strengths: breakdown.strengths,
          summary,
          user: { connect: { id: user.id } },
          weaknesses: breakdown.weaknesses,
        },
        where: { id: analysisId },
      });
      logger.info('[RESUME_CREATE] Updated resume analysis');

      // Send analysis completion notification
      await triggerResumeAnalysisNotification(
        user.id,
        userResume.id,
        userResume.name,
        'ats',
        'completed',
        score,
        (breakdown.recommendations?.priority_fixes?.length || 0) + 
        (breakdown.recommendations?.content_enhancements?.length || 0) + 
        (breakdown.recommendations?.long_term_improvements?.length || 0)
      );

      revalidateTag(`user:${user.id}:resumes:default`);
      revalidateTag(`user:${user.id}:report:resumes`);
      revalidateTag(`user:${user.id}:resumes`);
      revalidateTag(`user:${user.id}:resumes:queued`);
      revalidateTag(`user:${user.id}:resumes:${userResume.id}`);

      sendResumeOptimizationProgress({
        id: userResume.id,
        name: userResume.name,
        progress: 70,
        status: ResumeOptimizationStatus.OPTIMIZING,
      });

      if (!userResume.optimization?.analysisId) {
        throw new Error('Analysis not found');
      }

      const {
        recommendations: analysisRecommendations,
        score: analysisScore,
        summary: analysisSummary,
      } = resumeAnalysis;

      const {
        sections,
        spelling,
        strengths,
        weaknesses,
        achievements,
        formatting,
        grammar,
        keywords,
        readability,
      } = breakdown;

      logger.info('[RESUME_CREATE] Optimizing resume');
      const optimizedRevision = await optimizeResume({
        analysis: JSON.stringify({
          achievements,
          formatting,
          grammar,
          keywords,
          readability,
          recommendations: analysisRecommendations,
          score: analysisScore,
          sections,
          spelling,
          strengths,
          summary: analysisSummary,
          weaknesses,
        }),
        resumeMarkdown: refinedMarkdown,
        userProfile: user.profile ?? undefined,
      });
      logger.info('[RESUME_CREATE] Optimized resume');

      logger.info('[RESUME_CREATE] Converting optimized revision to Word');
      const docxBuffer = await convertMarkdownToWord(
        optimizedRevision.markdown,
      );
      logger.info('[RESUME_CREATE] Converted optimized revision to Word');

      // Prepare a unique path for the .docx file in Blob storage (user-specific folder and timestamp)
      const timestamp = Date.now();
      const blobPath = `/users/${user.id}/${userResume.name}-optimized-${timestamp}.docx`;

      logger.info(
        '[RESUME_CREATE] Uploading optimized revision to Blob storage',
      );
      // Upload the Word document buffer to Vercel Blob storage (public access)
      const { url: optimizedRevisionUrl } = await put(blobPath, docxBuffer, {
        access: 'public',
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // ✅ By default, @vercel/blob will use your Blob read-write token from env if configured
        // (You can optionally pass `token: process.env.BLOB_READ_WRITE_TOKEN` here if needed)
      });
      // `url` is the publicly accessible link to the uploaded .docx&#8203;:contentReference[oaicite:1]{index=1}

      logger.info(
        '[RESUME_CREATE] Uploaded optimized revision to Blob storage',
      );

      logger.info('[RESUME_CREATE] Updating resume');
      await db.resume.update({
        data: {
          defaultRevisionId: userResume.optimization?.resumeRevisionId,
          optimization: {
            update: {
              changelog: optimizedRevision.changelog,
              estimatedVisibilityBoost:
                optimizedRevision.confidence_metrics.estimated_visibility_boost,
              optimizationStrategy: optimizedRevision.optimization_strategy,
              previousScore: resumeAnalysis.score,
              progress: 100,
              projectedShortlistProbability:
                optimizedRevision.confidence_metrics
                  .projected_shortlist_probability,
              resumeRevision: {
                create: {
                  description: optimizedRevision.summary,
                  // json: optimizedRevision.json,
                  markdown: optimizedRevision.markdown,
                  name: `${name} - Optimized Revision`,
                  resume: { connect: { id: userResume.id } },
                  user: { connect: { id: user.id } },
                  wordDocumentUrl: optimizedRevisionUrl,
                },
              },
              score: optimizedRevision.ats_score,
              scoreImprovement: optimizedRevision.score_improvement.delta,
              scorePercentChange:
                optimizedRevision.score_improvement.percent_change,
              significantImprovements:
                optimizedRevision.score_improvement.significant_improvements,
              status: ResumeOptimizationStatus.COMPLETED,
              summary: optimizedRevision.summary,
            },
          },
        },
        where: { id: userResume.id },
      });
      logger.info('[RESUME_CREATE] Updated resume');

      revalidateTag(`user:${user.id}:resumes:default`);
      revalidateTag(`user:${user.id}:resumes:queued`);
      revalidateTag(`user:${user.id}:report:resumes`);
      revalidateTag(`user:${user.id}:resumes`);
      revalidateTag(`user:${user.id}:resumes:${userResume.id}`);
      revalidateTag(
        `user:${user.id}:resumes:${userResume.id}:revisions:${userResume.optimization?.resumeRevisionId}`,
      );

      sendResumeOptimizationProgress({
        id: userResume.id,
        name: userResume.name,
        progress: 100,
        status: ResumeOptimizationStatus.COMPLETED,
      });

      // sendNotification({
      //   channel: userChannel,
      //   payload: {
      //     actionText: 'View results',
      //     actionUrl: `/resumes/${userResume.id}`,
      //     description: `Resume optimization complete for '${name}'`,
      //     duration: 5000,
      //     title: 'Resume optimization complete',
      //     type: 'success',
      //   },
      // });
    } catch (error) {
      logger.error(error);
      
      // Send failure notification
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await triggerResumeAnalysisNotification(
        user.id,
        userResume.id,
        userResume.name,
        'ats',
        'failed',
        undefined,
        undefined,
        errorMessage
      );
      
      const updatedResume = await db.resume.update({
        data: {
          optimization: {
            update: { status: ResumeOptimizationStatus.FAILED },
          },
        },
        where: { id: userResume.id },
      });

      revalidateTag(`user:${user.id}:report:resumes`);
      revalidateTag(`user:${user.id}:resumes`);
      revalidateTag(`user:${user.id}:resumes:${userResume.id}`);
      revalidateTag(`user:${user.id}:resumes:queued`);
      revalidateTag(`user:${user.id}:resumes:default`);

      sendResumeOptimizationProgress({
        id: userResume.id,
        name: userResume.name,
        progress: 100,
        status: ResumeOptimizationStatus.FAILED,
      });

      return updatedResume;
    }
  });

  return userResume;
}
