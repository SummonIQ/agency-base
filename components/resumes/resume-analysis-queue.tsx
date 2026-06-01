'use client';

import {
  type Resume,
  ResumeAnalysis,
  ResumeAnalysisStatus,
} from '@prisma/client';
import { FileScan } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { ResumeAnalysisStatusBadge } from '@/components/resumes/resume-analysis-status-badge';
import { Progress } from '@/components/ui/progress';
import { ShimmerCard, ShimmerCardContent } from '@/components/ui/shimmer-card';
import { useEvent } from '@/hooks/use-event';
import { useUserChannel } from '@/hooks/use-user-channel';
import { cn } from '@/lib/css';
import { EventType } from '@/types/events';
import type { DataEventType } from '@/types/events/data-update';
import type { ResumeAnalysisProgressPayload } from '@/types/resumes';

export interface ResumeQueueProps {
  queue?: Array<Resume & { analysis: ResumeAnalysis }>;
}

const ResumeAnalysisQueue = ({ queue: resumeQueue }: ResumeQueueProps) => {
  const [queue, setQueue] = useState<
    Record<
      string,
      {
        progress: number;
      }
    >
  >(
    resumeQueue
      ?.filter(
        resume => resume.analysis?.status !== ResumeAnalysisStatus.COMPLETED,
      )
      ?.reduce(
        (acc, resume) => {
          acc[resume.id] = {
            progress: resume.analysis?.progress ?? 0,
          };
          return acc;
        },
        {} as Record<string, { progress: number }>,
      ) ?? {},
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const userChannel = useUserChannel();

  useEvent<{
    data: ResumeAnalysisProgressPayload;
    type: DataEventType.RESUME_ANALYSIS_PROGRESS;
  }>(userChannel, EventType.DataUpdate, payload => {
    if (!payload) return;

    const { id, progress } = payload.data;

    if (Object.keys(queue).length === 0 && progress >= 100) {
      return;
    }

    // startTransition(async () => {
    if (progress >= 100) {
      setQueue(prev => ({
        ...prev,
        [id]: {
          progress,
        },
      }));

      setTimeout(() => {
        setQueue(prev => {
          const newQueue = { ...prev };
          delete newQueue[id];
          return newQueue;
        });
        router.refresh();
      }, 1500);
    } else if (
      (queue[id]?.progress && progress > queue[id]?.progress) ||
      !queue[id]?.progress
    ) {
      setQueue(prev => ({
        ...prev,
        [id]: {
          progress,
        },
      }));
    }
    // });
  });

  const visible = Object.keys(queue).length > 0;

  return (
    <ShimmerCard
      className={cn(
        'mb-4 border-blue-400/15 bg-background shadow-sm shadow-muted/80 duration-300 animate-in fade-in',
        !visible && 'hidden',
      )}
    >
      <ShimmerCardContent className="gap-2 p-2">
        <h3 className="pl-1.5 pt-0.5 text-center font-semibold text-muted-foreground/90">
          Resume Analysis Queue
        </h3>
        <div className="flex w-full flex-col gap-2">
          {Object.keys(queue).map(resumeId => {
            const resume = resumeQueue?.find(resume => resume.id === resumeId);

            if (!resume) return null;
            const resumeAnalysisProgress =
              queue[resume.id]?.progress ?? resume.analysis?.progress;

            const roundedProgress = Math.ceil(resumeAnalysisProgress);

            return (
              <Link
                className=" flex w-full cursor-pointer flex-row rounded-md border border-border/50 bg-background px-4 py-3 shadow-sm ring-offset-0 transition-all duration-300 hover:border-transparent hover:shadow-md hover:shadow-blue-500/20 hover:ring-2 hover:ring-blue-500/40"
                href={`/profile/resumes/${resume.id}`}
                key={resume.id}
              >
                <div className="-mt-1 flex items-start justify-center py-2">
                  <FileScan className="size-5 text-orange-500" />
                </div>

                <div className="flex flex-col border-r border-border/50 px-3.5 py-0.5 pr-6">
                  <h5 className="text-sm font-semibold text-foreground/75">
                    {resume.name}
                  </h5>
                  <p className="text-pretty text-xs text-muted-foreground/70">
                    Started {new Date(resume.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-row items-center gap-2 border-r border-border/50 px-6">
                  <ResumeAnalysisStatusBadge
                    status={
                      resume.analysis?.status ??
                      (roundedProgress === 100
                        ? ResumeAnalysisStatus.COMPLETED
                        : ResumeAnalysisStatus.FAILED)
                    }
                  />
                </div>
                <div className="flex grow flex-col justify-center gap-1 pl-6">
                  <div className="flex flex-row items-center justify-between gap-1">
                    <p className="flex-nowrap text-xs font-medium text-muted-foreground">
                      <b>
                        {resumeAnalysisProgress
                          ? `${Math.ceil(resumeAnalysisProgress)}%`
                          : resume.analysis?.progress
                            ? `${resume.analysis.progress * 100}%`
                            : '0%'}
                      </b>
                      {' complete'}
                    </p>
                    {/* <p className="text-xs text-muted-foreground">
                      <b>
                        {queue[resume.id]?.jobListingsCount
                          ? queue[resume.id]?.jobListingsCount
                          : (resume.jobListingsCount ?? 0)}
                      </b>{' '}
                      job listings added
                    </p> */}
                  </div>
                  <Progress
                    className="h-2.5 [&>div]:bg-blue-500"
                    value={resumeAnalysisProgress}
                    // variant="default"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </ShimmerCardContent>
    </ShimmerCard>
  );
};
ResumeAnalysisQueue.displayName = 'ResumeAnalysisQueue';

export { ResumeAnalysisQueue };
