'use client';

import {
  Resume,
  ResumeAnalysis,
  ResumeOptimization,
  ResumeOptimizationStatus,
} from '@prisma/client';
import { FileScan } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Progress } from '@/components/ui/progress';
import { ShimmerCard, ShimmerCardContent } from '@/components/ui/shimmer-card';
import { useEvent } from '@/hooks/use-event';
import { useUserChannel } from '@/hooks/use-user-channel';
import { cn } from '@/lib/css';
import { QueueState } from '@/types/data';
import { EventType } from '@/types/events';
import type { DataEventType } from '@/types/events/data-update';
import type { ResumeOptimizationProgressPayload } from '@/types/resumes';

import { DateLabel } from '../data/date-label';
import { ResumeOptimizationStatusBadge } from './resume-optimization-status-badge';

export interface ResumeOptimizationQueueProps {
  queue?: Array<
    Resume & {
      analysis?: ResumeAnalysis | null;
      analysisId?: string | null;
      createdAt?: Date;
      id?: string;
      name?: string;
      optimization?: ResumeOptimization | null;
      optimizationId?: string | null;
      updatedAt?: Date;
    }
  >;
}

const ResumeOptimizationQueue = ({
  queue: resumeOptimizationQueue,
}: ResumeOptimizationQueueProps) => {
  const userChannel = useUserChannel();
  const [queue, setQueue] = useState<QueueState<ResumeOptimizationStatus>>(
    resumeOptimizationQueue
      ?.filter(resume => resume.optimization?.progress !== 100)
      .reduce((acc, resume) => {
        if (resume.optimization?.progress !== undefined) {
          acc[resume.id as string] = {
            ...resume,
            createdAt: resume.createdAt,
            name: resume?.name ?? '',
            progress: resume.optimization?.progress ?? 0,
            status:
              resume.optimization?.status ?? ResumeOptimizationStatus.QUEUED,
            updatedAt: resume.updatedAt,
          };
        }
        return acc;
      }, {} as QueueState<ResumeOptimizationStatus>) ?? {},
  );

  useEvent<{
    data: ResumeOptimizationProgressPayload;
    type: DataEventType.RESUME_OPTIMIZATION_PROGRESS;
  }>(userChannel, EventType.DataUpdate, async payload => {
    if (!payload) return;

    const { id, progress, status, name } = payload.data;

    if (progress >= 100) {
      setQueue(prev => {
        const newQueue = { ...prev };
        delete newQueue[id];
        return newQueue;
      });
    } else {
      // startTransition(async () => {
      setQueue(prev => {
        const newQueue = { ...prev };
        newQueue[id] = {
          ...newQueue[id],
          createdAt: !newQueue[id] ? new Date() : newQueue[id].createdAt,
          name,
          progress,
          status,
          updatedAt: new Date(),
        };

        return newQueue;
      });
      // });
    }
  });

  const visible = Object.keys(queue).length > 0;

  return (
    <ShimmerCard
      className={cn(
        '&:before:absolute &:before:inset-0 &:before:bg-blue-500/50 &:before:blur-sm &:before:z-10 relative bg-background shadow-sm shadow-muted/80 transition-all duration-300',
        !visible
          ? 'scale-y-30 mb-0 !h-0 -translate-y-6 overflow-hidden border-none border-transparent opacity-0 shadow-none shadow-transparent'
          : 'mb-4 translate-y-0 scale-y-100 border-blue-400/15 opacity-100',
      )}
    >
      <ShimmerCardContent className={cn(!visible ? '' : 'gap-2 p-2')}>
        <h3 className="pl-1.5 pt-0.5 text-center font-semibold text-muted-foreground/90">
          Resume Optimization Queue
        </h3>
        <div className="flex w-full flex-col gap-2">
          {Object.keys(queue).map(resumeId => {
            // const resume = resumeOptimizationQueue?.find(
            //   resumeOpt => resumeOpt.id === resumeId,
            // );

            // if (!resume) return null;

            const { name, progress, status } = queue[resumeId];
            const roundedProgress = Math.ceil(progress ?? 0);

            return (
              <Link
                className="flex w-full cursor-pointer flex-col rounded-md border border-border/50 bg-background p-3 shadow-sm ring-offset-0 transition-all duration-300 hover:border-transparent hover:shadow-md hover:shadow-blue-500/20 hover:ring-2 hover:ring-blue-500/40 md:flex-row"
                href={`/profile/resumes/${resumeId}`}
                key={resumeId}
              >
                <div className="flex w-full flex-row items-center gap-1 pb-2 md:w-2/5">
                  <div className="-mt-1 flex items-start justify-center rounded-sm bg-amber-500/10 p-2">
                    <FileScan className="size-5 text-amber-500" />
                  </div>

                  <div className="flex flex-col px-3.5 py-0.5">
                    <h5 className="text-sm font-semibold text-foreground/75">
                      {name}
                    </h5>
                    <p className="text-pretty text-xs text-muted-foreground/70">
                      Started{' '}
                      <DateLabel
                        date={queue[resumeId]?.createdAt ?? new Date()}
                      />
                    </p>
                  </div>

                  {/* <div className="flex flex-row items-center gap-2 border-r border-border/50 px-6">
                    <ResumeOptimizationStatusBadge status={status} />
                  </div> */}
                </div>

                <div className="flex grow flex-col justify-center gap-1 rounded-sm border border-border/50 bg-accent/20 p-3">
                  <div className="flex flex-row items-center justify-between gap-1">
                    <p className="flex-nowrap text-xs font-medium text-muted-foreground">
                      <b>{`${roundedProgress}%`}</b>
                      {' complete'}
                    </p>

                    <ResumeOptimizationStatusBadge
                      className="bg-transparent p-0"
                      status={status}
                      variant="ghost"
                    />

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
                    value={progress}
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
ResumeOptimizationQueue.displayName = 'ResumeOptimizationQueue';

export { ResumeOptimizationQueue };
