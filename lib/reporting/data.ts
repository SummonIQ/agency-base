import {
  JobLead,
  JobListing,
  JobSearch,
  Prisma,
  Resume,
  ResumeRevision,
} from '@prisma/client';

import { db } from '@/lib/db';
import { buildPrismaQuery } from '@/lib/db/query';
import { ApiQuery } from '@/types/reporting/query';

export type GetReportDataOptions = {
  cacheKey?: string;
  userId: string;
} & (
  | {
      apiQuery: ApiQuery<JobLead, Prisma.JobLeadInclude>;
      include?: Prisma.JobLeadInclude;
      model: 'job-leads';
    }
  | {
      apiQuery: ApiQuery<JobListing, Prisma.JobListingInclude>;
      include?: Prisma.JobListingInclude;
      model: 'job-listings';
    }
  | {
      apiQuery: ApiQuery<JobSearch, Prisma.JobSearchInclude>;
      include?: Prisma.JobSearchInclude;
      model: 'job-searches';
    }
  | {
      apiQuery: ApiQuery<Resume, Prisma.ResumeInclude>;
      include?: Prisma.ResumeInclude;
      model: 'resumes';
    }
  | {
      apiQuery: ApiQuery<ResumeRevision, Prisma.ResumeRevisionInclude>;
      include?: Prisma.ResumeRevisionInclude;
      model: 'resume-revisions';
    }
);

export async function getReportData({
  model,
  apiQuery,
  cacheKey,
  userId,
}: { cacheKey?: string; userId: string } & (
  | {
      apiQuery: ApiQuery<JobLead, Prisma.JobLeadInclude>;
      model: 'job-leads';
    }
  | {
      apiQuery: ApiQuery<JobListing, Prisma.JobListingInclude>;
      model: 'job-listings';
    }
  | {
      apiQuery: ApiQuery<JobSearch, Prisma.JobSearchInclude>;
      model: 'job-searches';
    }
  | {
      apiQuery: ApiQuery<Resume, Prisma.ResumeInclude>;
      model: 'resumes';
    }
)): Promise<{
  data: Array<JobLead | JobListing | JobSearch | Resume>;
  pagination: {
    total: number;
  };
}> {
  // 'use cache';

  // cacheTag(`user:${userId}:report:${model}${cacheKey ? `:${cacheKey}` : ''}`);

  switch (model) {
    case 'job-leads': {
      const prismaQuery = buildPrismaQuery<JobLead, Prisma.JobLeadInclude>({
        ...apiQuery,
        include: {
          jobFitAnalysis: true,
          jobListing: true,
          optimization: {
            include: {
              resumeRevision: true,
            },
          },
        },
      });

      const [data, count] = await db.$transaction([
        db.jobLead.findMany(prismaQuery),
        db.jobLead.count({ where: prismaQuery.where }),
      ]);

      return {
        data: data as Array<JobLead>,
        pagination: {
          total: count,
        },
      };
    }
    case 'job-listings': {
      const prismaQuery = buildPrismaQuery<
        JobListing,
        Prisma.JobListingInclude
      >(apiQuery);

      const [data, count] = await db.$transaction([
        db.jobListing.findMany(prismaQuery),
        db.jobListing.count({ where: prismaQuery.where }),
      ]);

      return {
        data: data as Array<JobListing>,
        pagination: {
          total: count,
        },
      };
    }
    case 'job-searches': {
      const prismaQuery = buildPrismaQuery<JobSearch, Prisma.JobSearchInclude>({
        ...apiQuery,
        include: {
          jobListings: {
            select: {
              id: true,
            },
          },
        },
      });

      const [data, count] = await db.$transaction([
        db.jobSearch.findMany(prismaQuery),
        db.jobSearch.count({ where: prismaQuery.where }),
      ]);

      return {
        data: data as Array<JobSearch>,
        pagination: {
          total: count,
        },
      };
    }
    case 'resumes': {
      const prismaQuery = buildPrismaQuery<Resume, Prisma.ResumeInclude>({
        ...apiQuery,
        include: {
          ...apiQuery.include,
          analysis: true, // TODO: Do I need this?
          optimization: {
            include: {
              analysis: true,
              resumeRevision: true,
            },
          },
        },
        sort: [{ direction: 'desc', field: 'createdAt' }],
      });

      const [data, count] = await db.$transaction([
        db.resume.findMany(prismaQuery),
        db.resume.count({ where: prismaQuery.where }),
      ]);

      return {
        data: data as Array<Resume>,
        pagination: {
          total: count,
        },
      };
    }
    default:
      throw new Error(`Model ${model} not found`);
  }
}
