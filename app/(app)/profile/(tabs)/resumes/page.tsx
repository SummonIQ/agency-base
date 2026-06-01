import { Prisma, Resume, ResumeOptimizationStatus, User } from '@prisma/client';
import { Suspense } from 'react';

import { ResumeEditor } from '@/components/resumes/resume-editor';
import { ResumeOptimizationQueue } from '@/components/resumes/resume-optimization-queue';
import { ResumesReport } from '@/components/resumes/resumes-report';
import {
  CardActions,
  CardDescription,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { cacheTag } from '@/lib/cache';
import { getReportData } from '@/lib/reporting';
import { createUserResume, getUserResumes } from '@/lib/resumes';
import { deleteResume } from '@/lib/resumes';
import { getCurrentUser } from '@/lib/user';
import { getUserDefaultResumeId } from '@/lib/user/resumes';
import {
  WithOptionalResumeAnalysis,
  WithOptionalResumeRevisions,
} from '@/types/domain/resume';
import { WithOptionalResumeOptimization } from '@/types/domain/resume';
import { WithOptionalUserProfile } from '@/types/domain/user';
import { ApiQuery } from '@/types/reporting/query';

async function getQueuedResumes({ userId }: { userId: string }) {
  'use cache';

  cacheTag(`user:${userId}:resumes:queued`);

  const queuedResumes = await getUserResumes({
    include: {
      analysis: true,
      optimization: true,
    },
    statuses: [
      ResumeOptimizationStatus.QUEUED,
      ResumeOptimizationStatus.PROCESSING,
      ResumeOptimizationStatus.REFINING,
      ResumeOptimizationStatus.ANALYZING,
      ResumeOptimizationStatus.OPTIMIZING,
    ],
    userId,
  });

  return queuedResumes;
}

async function getDefaultResumeId({ userId }: { userId: string }) {
  'use cache';

  cacheTag(`user:${userId}:resumes:default`);

  const defaultResumeId = await getUserDefaultResumeId(userId);

  return defaultResumeId ?? undefined;
}

const initialResumesReportQuery: ApiQuery<Resume, Prisma.ResumeInclude> = {
  include: {
    analysis: true,
    optimization: true,
  },
  pagination: {
    count: 10,
    start: 0,
  },
  sort: [{ direction: 'desc', field: 'createdAt' }],
};

// export const experimental_ppr = true;

async function getResumesReportData({ userId }: { userId: string }) {
  cacheTag(`user:${userId}:report:resumes`);

  const { data: resumes } = await getReportData({
    apiQuery: initialResumesReportQuery,
    model: 'resumes',
    userId,
  });

  return resumes;
}

export const experimental_ppr = true;

export default async function Resumes() {
  const user = (await getCurrentUser({
    include: { profile: true },
  })) as WithOptionalUserProfile<User>;
  const defaultResumeId = await getDefaultResumeId({ userId: user.id });
  const queuedResumes = await getQueuedResumes({ userId: user.id });
  const resumes = await getResumesReportData({ userId: user.id });

  return (
    <>
      <Suspense fallback={<></>}>
        <ResumeOptimizationQueue
          queue={queuedResumes.filter(
            resume =>
              resume.optimization?.status !==
                ResumeOptimizationStatus.COMPLETED &&
              (resume.optimization?.status ===
                ResumeOptimizationStatus.QUEUED ||
                resume.optimization?.status ===
                  ResumeOptimizationStatus.PROCESSING ||
                resume.optimization?.status ===
                  ResumeOptimizationStatus.REFINING ||
                resume.optimization?.status ===
                  ResumeOptimizationStatus.ANALYZING ||
                resume.optimization?.status ===
                  ResumeOptimizationStatus.OPTIMIZING),
          )}
        />
      </Suspense>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardSummary>
            <CardTitle>My Resumes</CardTitle>
            <CardDescription>View and manage your resumes.</CardDescription>
          </CardSummary>

          <CardActions>
            <ResumeEditor
              action={async values => {
                'use server';

                const { name, url, description, setDefault } = values;

                const newResume = await createUserResume({
                  description,
                  name,
                  setDefault,
                  url,
                });

                return newResume;
              }}
              showTrigger={true}
            />
          </CardActions>
        </CardHeader>
        <CardContent className="bg-accent/30 p-2 md:p-2">
          <Suspense fallback={<></>}>
            <ResumesReport
              defaultResumeId={defaultResumeId}
              deleteResume={async resumeId => {
                'use server';

                await deleteResume(resumeId);
              }}
              initialData={
                resumes as Array<
                  WithOptionalResumeOptimization<
                    WithOptionalResumeAnalysis<
                      WithOptionalResumeRevisions<Resume>
                    >
                  >
                >
              }
              initialQuery={initialResumesReportQuery}
              showColumnToggle={true}
              showPagination={true}
              showSearch={true}
            />
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
