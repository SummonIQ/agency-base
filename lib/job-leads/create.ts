'use server';

import type { JobLead, Prisma } from '@prisma/client';
import {
  JobFitAnalysisStatus,
  JobLeadOptimizationStatus,
  JobListingStatus,
  ResumeOptimizationStatus,
} from '@prisma/client';
import { put } from '@vercel/blob';
import { unauthorized } from 'next/navigation';
import { after } from 'next/server';

import { revalidateTag } from '@/lib/cache';
import { db } from '@/lib/db';
import { getPrivateUserChannel } from '@/lib/events/channels';
import { sendDataUpdate } from '@/lib/events/data-update';
import { getUserResume, optimizeResume } from '@/lib/resumes';
import { getResumeRevision } from '@/lib/resumes/revisions';
import { getCurrentUser } from '@/lib/user';
import { DataEventType } from '@/types/events';

import { convertMarkdownToWord } from '../files/convert/markdown-to-word';
import { logger } from '../logger';
import { analyzeJobFit } from './analyze/job-fit';

export async function createJobLead({
  jobListingId,
}: {
  jobListingId: string;
}) {
  const user = await getCurrentUser({
    include: {
      profile: true,
    },
  });
  const userChannel = getPrivateUserChannel(user.id);

  logger.info('[JOB_LEAD_CREATE] Updating job listing status');
  // Update job listing status
  const jobListing = await db.jobListing.update({
    data: { status: JobListingStatus.ADDED_TO_LEADS },
    where: { id: jobListingId, userId: user.id },
  });
  logger.info('[JOB_LEAD_CREATE] Updated job listing status');

  logger.info('[JOB_LEAD_CREATE] Creating job lead');
  const jobLead = await db.jobLead.create({
    data: {
      jobListing: { connect: { id: jobListingId } },
      optimization: {
        create: {
          status: JobLeadOptimizationStatus.QUEUED,
          user: { connect: { id: user.id } },
        },
      },
      title: jobListing?.title,
      user: { connect: { id: user.id } },
    },
  });
  logger.info('[JOB_LEAD_CREATE] Created job lead');

  logger.info('[JOB_LEAD_CREATE] Revalidating tags');
  revalidateTag(`user:${user.id}:report:job-leads`);
  revalidateTag(`user:${user.id}:job-leads`);
  revalidateTag(`user:${user.id}:job-leads:count`);
  revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
  revalidateTag(`user:${user.id}:report:job-listings`);
  revalidateTag(`user:${user.id}:job-listings`);
  revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
  logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

  logger.info('[JOB_LEAD_CREATE] Creating resume optimization');
  const optimization = await db.resumeOptimization.create({
    data: {
      jobLead: { connect: { id: jobLead.id } },
      status: ResumeOptimizationStatus.PROCESSING,
      user: { connect: { id: user.id } },
    },
  });
  logger.info('[JOB_LEAD_CREATE] Created resume optimization');

  logger.info('[JOB_LEAD_CREATE] Revalidating tags');
  revalidateTag(`user:${user.id}:report:job-leads`);
  revalidateTag(`user:${user.id}:job-leads`);
  revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
  revalidateTag(`user:${user.id}:report:job-listings`);
  revalidateTag(`user:${user.id}:job-listings`);
  revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
  logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

  logger.info('[JOB_LEAD_CREATE] Retrieving default resume');
  const defaultResumeId = user.defaultResumeId;
  const defaultResumeParent = defaultResumeId
    ? await getUserResume({
        id: defaultResumeId,
        include: { analysis: true },
        userId: user.id,
      })
    : undefined;
  logger.info('[JOB_LEAD_CREATE] Retrieved default resume');

  logger.info('[JOB_LEAD_CREATE] Retrieving default revision');
  const defaultRevisionId = defaultResumeParent?.defaultRevisionId;
  const defaultRevision = defaultRevisionId
    ? await getResumeRevision({
        id: defaultRevisionId,
        include: {
          jobFitAnalysis: true,
          optimization: true,
          resumeAnalysis: true,
        },
        userId: user.id,
      })
    : undefined;
  logger.info('[JOB_LEAD_CREATE] Retrieved default revision');

  logger.info('[JOB_LEAD_CREATE] Retrieving default resume');
  const defaultResume = defaultRevisionId
    ? defaultRevision
    : defaultResumeParent;
  logger.info('[JOB_LEAD_CREATE] Retrieved default resume');

  logger.info('[JOB_LEAD_CREATE] Checking if default resume is available');
  if (!defaultResumeId) {
    sendDataUpdate({
      channel: userChannel,
      payload: {
        data: { id: jobLead.id, progress: 100 },
        type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
      },
    });

    logger.info('[JOB_LEAD_CREATE] Updating job lead');
    await db.jobLead.update({
      data: {
        jobFitAnalysis: { update: { status: JobFitAnalysisStatus.FAILED } },
        optimization: { update: { status: JobLeadOptimizationStatus.FAILED } },
      },
      where: { id: jobLead.id, userId: user.id },
    });
    logger.info('[JOB_LEAD_CREATE] Updated job lead');

    logger.info('[JOB_LEAD_CREATE] Revalidating tags');
    revalidateTag(`user:${user.id}:report:job-leads`);
    revalidateTag(`user:${user.id}:job-leads`);
    revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
    revalidateTag(`user:${user.id}:report:job-listings`);
    revalidateTag(`user:${user.id}:job-listings`);
    revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
    logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

    logger.info('[JOB_LEAD_CREATE] Updating resume optimization');
    await db.resumeOptimization.update({
      data: { status: ResumeOptimizationStatus.FAILED },
      where: { id: optimization.id },
    });
    logger.info('[JOB_LEAD_CREATE] Updated resume optimization');

    logger.info('[JOB_LEAD_CREATE] Revalidating tags');
    revalidateTag(`user:${user.id}:report:job-leads`);
    revalidateTag(`user:${user.id}:job-leads`);
    revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
    revalidateTag(`user:${user.id}:report:job-listings`);
    revalidateTag(`user:${user.id}:job-listings`);
    revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
    logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

    throw new Error('No default resume found');
  }

  sendDataUpdate({
    channel: userChannel,
    payload: {
      data: { id: jobLead.id, progress: 20 },
      type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
    },
  });

  after(async () => {
    logger.info('[JOB_LEAD_CREATE] Starting after');
    if (!defaultResumeId) {
      logger.info('[JOB_LEAD_CREATE] No default resume found');
      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 100 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info('[JOB_LEAD_CREATE] Updating job lead');
      await db.jobLead.update({
        data: {
          jobFitAnalysis: { update: { status: JobFitAnalysisStatus.FAILED } },
          optimization: {
            update: { status: JobLeadOptimizationStatus.FAILED },
          },
        },
        where: { id: jobLead.id, userId: user.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated job lead');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      revalidateTag(`user:${user.id}:report:job-listings`);
      revalidateTag(`user:${user.id}:job-listings`);
      revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updating resume optimization');
      await db.resumeOptimization.update({
        data: { status: ResumeOptimizationStatus.FAILED },
        where: { id: optimization.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated resume optimization');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      revalidateTag(`user:${user.id}:report:job-listings`);
      revalidateTag(`user:${user.id}:job-listings`);
      revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      throw new Error('No default resume found');
    } else {
      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 25 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info('[JOB_LEAD_CREATE] Updating resume optimization');
      await db.resumeOptimization.update({
        data: { status: ResumeOptimizationStatus.ANALYZING },
        where: { id: optimization.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated resume optimization');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      revalidateTag(`user:${user.id}:report:job-listings`);
      revalidateTag(`user:${user.id}:job-listings`);
      revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updating job lead optimization');
      await db.jobLeadOptimization.update({
        data: { status: JobLeadOptimizationStatus.ANALYZING },
        where: { jobLeadId: jobLead.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated job lead optimization');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      revalidateTag(`user:${user.id}:report:job-listings`);
      revalidateTag(`user:${user.id}:job-listings`);
      revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 40 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info(
        '[JOB_LEAD_CREATE] Formatting job listing details for analysis',
      );
      const formattedJobListing = `
Company: ${jobListing?.company}
Title: ${jobListing?.title}
Location: ${jobListing?.location}
Description: ${jobListing?.description}
${jobListing?.requirements ? `Requirements:\n${jobListing.requirements.map(req => `- ${req}`).join('\n')}` : ''}
${jobListing?.responsibilities ? `Responsibilities:\n${jobListing.responsibilities.map(res => `- ${res}`).join('\n')}` : ''}
    `;
      logger.info(
        '[JOB_LEAD_CREATE] Formatted job listing details for analysis',
      );

      logger.info('[JOB_LEAD_CREATE] Running job fit analysis');
      // Run the job fit analysis.
      const analysis = await analyzeJobFit({
        jobDescription: formattedJobListing,
        resumeMarkdown: defaultResume?.markdown ?? '',
      });
      logger.info('[JOB_LEAD_CREATE] Job fit analysis completed');

      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 50 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info('[JOB_LEAD_CREATE] Creating job fit analysis');
      // Save the analysis and connect it to the job lead, job listing, resume, and revision.
      const jobFitAnalysis = await db.jobFitAnalysis.create({
        data: {
          additionalMetrics:
            analysis.additional_metrics as Prisma.InputJsonValue,
          educationRelevanceScore: analysis.education_relevance_score,
          experienceRelevanceScore: analysis.experience_relevance_score,
          jobLead: { connect: { id: jobLead.id } },
          jobListing: { connect: { id: jobListing.id } },
          keywordMatch: analysis.keyword_match,
          missingKeywords: analysis.missing_keywords,
          overallMatchScore: analysis.overall_match_score,
          recommendations: analysis.recommendations,
          resume: defaultResumeId
            ? { connect: { id: defaultResumeId } }
            : { connect: { id: defaultRevision?.resumeId } },
          resumeRevision: defaultRevisionId
            ? { connect: { id: defaultRevisionId } }
            : undefined,
          skillsAlignment: analysis.skills_alignment,
          status: JobFitAnalysisStatus.COMPLETED,
          summary: analysis.fit_summary,
        },
      });
      logger.info('[JOB_LEAD_CREATE] Created job fit analysis');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      revalidateTag(`user:${user.id}:report:job-listings`);
      revalidateTag(`user:${user.id}:job-listings`);
      revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updating job lead optimization');
      await db.jobLeadOptimization.update({
        data: {
          jobFitAnalysis: { connect: { id: jobFitAnalysis.id } },
          status: JobLeadOptimizationStatus.OPTIMIZING,
        },
        where: { jobLeadId: jobLead.id },
      });

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updated job lead optimization');
      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 60 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info('[JOB_LEAD_CREATE] Updating resume optimization');
      await db.resumeOptimization.update({
        data: { status: ResumeOptimizationStatus.OPTIMIZING },
        where: { id: optimization.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated resume optimization');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Optimizing resume');
      const {
        educationRelevanceScore,
        experienceRelevanceScore,
        keywordMatch,
        skillsAlignment,
        missingKeywords,
        overallMatchScore,
        recommendations,
        summary,
      } = jobFitAnalysis;
      // Generate an optimized revision from the default revision.
      const optimizedResult = await optimizeResume({
        analysis: JSON.stringify({
          educationRelevanceScore,
          experienceRelevanceScore,
          keywordMatch,
          missingKeywords,
          overallMatchScore,
          recommendations,
          skillsAlignment,
          summary,
        }),
        jobListing: formattedJobListing,
        resumeMarkdown: defaultResume?.markdown ?? '',
        userProfile: user.profile ?? undefined,
      });
      logger.info('[JOB_LEAD_CREATE] Optimized resume');

      logger.info('[JOB_LEAD_CREATE] Converting optimized revision to Word');
      const docxBuffer = await convertMarkdownToWord(optimizedResult.markdown);
      logger.info('[JOB_LEAD_CREATE] Converted optimized revision to Word');

      // Prepare a unique path for the .docx file in Blob storage (user-specific folder and timestamp)
      const timestamp = Date.now();
      const blobPath = `/users/${user.id}/${defaultResumeId}-optimized-${jobLead.title.toLowerCase().replace(/ /g, '-')}-${timestamp}.docx`;

      logger.info(
        '[JOB_LEAD_CREATE] Uploading optimized revision to Blob storage',
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
        '[JOB_LEAD_CREATE] Uploaded optimized revision to Blob storage',
      );

      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 65 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info('[JOB_LEAD_CREATE] Creating new revision');
      // Create a new optimized revision with extra properties.
      const newRevision = await db.resumeRevision.create({
        data: {
          jobFitAnalysis: { connect: { id: jobFitAnalysis.id } },
          // json: optimizedResult.json,
          markdown: optimizedResult.markdown,
          name: `${jobListing?.title} - ${defaultResume?.name}`,
          optimization: {
            connect: { id: optimization.id },
          },
          resume: { connect: { id: defaultResumeId } },
          user: { connect: { id: user.id } },
          wordDocumentUrl: optimizedRevisionUrl,
        },
      });
      logger.info('[JOB_LEAD_CREATE] Created new revision');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updating resume optimization');
      // Update the existing optimization with the results
      await db.resumeOptimization.update({
        data: {
          changelog: optimizedResult.changelog,
          estimatedVisibilityBoost:
            optimizedResult.confidence_metrics.estimated_visibility_boost,
          jobFitAnalysis: { connect: { id: jobFitAnalysis.id } },
          optimizationStrategy: optimizedResult.optimization_strategy,
          previousScore: optimizedResult?.score_improvement.previous_score,
          projectedShortlistProbability:
            optimizedResult.confidence_metrics.projected_shortlist_probability,
          resume: { connect: { id: defaultResumeId } },
          score: optimizedResult.ats_score,
          scoreImprovement: optimizedResult.score_improvement.delta,
          scorePercentChange: optimizedResult.score_improvement.percent_change,
          significantImprovements:
            optimizedResult.score_improvement.significant_improvements,
          status: ResumeOptimizationStatus.COMPLETED,
          summary: optimizedResult.summary,
        },
        where: { id: optimization.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated resume optimization');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updating job lead optimization');
      // Update JobLeadOptimization with the resume revision and mark as completed
      await db.jobLeadOptimization.update({
        data: {
          resumeRevision: { connect: { id: newRevision.id } },
          status: JobLeadOptimizationStatus.COMPLETED,
        },
        where: { jobLeadId: jobLead.id },
      });
      logger.info('[JOB_LEAD_CREATE] Updated job lead optimization');

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updating job lead');
      await db.jobLead.update({
        data: {
          jobFitAnalysis: {
            update: { status: JobFitAnalysisStatus.COMPLETED },
          },
          resumeRevisions: { connect: { id: newRevision.id } },
        },
        where: { id: jobLead.id, userId: user.id },
      });

      logger.info('[JOB_LEAD_CREATE] Revalidating tags');
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Finished revalidating tags');

      logger.info('[JOB_LEAD_CREATE] Updated job lead');
      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 85 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });

      logger.info('[JOB_LEAD_CREATE] Revalidating job listings');
      revalidateTag(`user:${user.id}:report:job-listings`);
      revalidateTag(`user:${user.id}:report:job-leads`);
      revalidateTag(`user:${user.id}:job-listings`);
      revalidateTag(`user:${user.id}:job-listings:${jobListingId}`);
      revalidateTag(`user:${user.id}:job-leads`);
      revalidateTag(`user:${user.id}:job-leads:${jobLead.id}`);
      logger.info('[JOB_LEAD_CREATE] Revalidated job leads');
      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: { id: jobLead.id, progress: 100 },
          type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS,
        },
      });
    }
  });

  return jobLead;
}

export async function createJobLeads(
  ids: Array<string>,
): Promise<Array<JobLead>> {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  const jobLeads: Array<JobLead> = [];

  for (const jobListingId of ids) {
    const jobLead = await createJobLead({ jobListingId });
    jobLeads.push(jobLead);
  }

  return jobLeads;
}
