'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useEvent } from '@/hooks/use-event';
import { useUserChannel } from '@/hooks/use-user-channel';
import { cn } from '@/lib/css';
import { EventType } from '@/types/events';
import { DataEventType } from '@/types/events/data-update';
import type { JobLeadOptimizationProgressPayload } from '@/types/job-lead/event';

export type JobLeadProgressTrackerProps = {
  analyzeComplete: boolean;
  analyzeProgress: number;
  createComplete: boolean;
  jobLeadId: string;
  // optimizedComplete: boolean;
  optimizedProgress: number;
};

const JobLeadProgressTracker = ({
  jobLeadId,
  createComplete,
  analyzeComplete,
  analyzeProgress: initialAnalyzeProgress,
  // optimizedComplete: initialOptimizedComplete,
  optimizedProgress: initialOptimizedProgress,
}: JobLeadProgressTrackerProps) => {
  const [analyzeProgress, setAnalyzeProgress] = useState(
    initialAnalyzeProgress,
  );
  const [optimizedProgress, setOptimizedProgress] = useState(
    initialOptimizedProgress,
  );
  // const [optimizedComplete, setOptimizedComplete] = useState(
  //   initialOptimizedComplete,
  // );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const userChannel = useUserChannel();

  useEvent<{
    data: JobLeadOptimizationProgressPayload;
    type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS;
  }>(userChannel, EventType.DataUpdate, payload => {
    if (!payload) return;

    const { id, progress } = payload.data;

    if (id !== jobLeadId) return;

    startTransition(async () => {
      if (progress >= 100) {
        // setOptimizedComplete(true);
        setOptimizedProgress(100);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else if (progress > optimizedProgress) {
        if (progress >= 0 && progress < 60) {
          setAnalyzeProgress(progress);
        } else if (progress >= 60) {
          setOptimizedProgress(progress);
          setAnalyzeProgress(100);
        }
      }
    });
  });

  return (
    <div className="mb-4 flex w-full items-center gap-x-2 rounded-md border border-border/70 p-5 pb-8 shadow-sm drop-shadow-lg">
      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full',
            createComplete ? 'bg-yellow-400' : 'bg-slate-400',
          )}
        />

        <div
          className={cn(
            'absolute top-full pt-1.5 text-xs font-semibold',
            createComplete ? 'text-yellow-400' : 'text-slate-400',
          )}
        >
          Added
        </div>
      </div>

      <div
        className={cn(
          'h-1.5 w-1/2 rounded-full bg-gradient-to-r from-10%',
          createComplete ? 'from-yellow-400/30' : 'from-slate-400/30',
          analyzeComplete ? 'to-blue-400/50' : 'to-slate-400/50',
          analyzeProgress > 0 && analyzeProgress < 100 && 'animate-pulse',
        )}
      />

      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full bg-blue-400',
            analyzeComplete ? 'bg-blue-400' : 'bg-slate-400/50',
            analyzeProgress > 0 && analyzeProgress < 100 && 'animate-pulse',
          )}
        />

        <div
          className={cn(
            'absolute left-0.5 top-full pt-1.5 text-xs font-semibold',
            analyzeComplete ? 'text-blue-400' : 'text-slate-400',
            analyzeProgress > 0 && analyzeProgress < 100 && 'animate-pulse',
          )}
        >
          {analyzeComplete
            ? 'Analyzed'
            : analyzeProgress > 0 && analyzeProgress < 100
              ? 'Analyzing...'
              : ''}
        </div>
      </div>

      <div
        className={cn(
          'h-1.5 w-1/2 rounded-full bg-gradient-to-r from-10%',
          analyzeComplete ? 'from-blue-500/40' : 'from-slate-400/30',
          // optimizedComplete ? 'to-green-400/30' : 'to-slate-400/50',
          optimizedProgress > 0 && optimizedProgress < 100 && 'animate-pulse',
        )}
      />

      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full',
            // optimizedComplete ? 'bg-green-500' : 'bg-slate-400/50',
            optimizedProgress > 0 && optimizedProgress < 100 && 'animate-pulse',
          )}
        />

        <div
          className={cn(
            'absolute right-0 text-slate-400 top-full pt-1.5 text-xs font-semibold text-right',
            // optimizedComplete ? 'text-green-500' : 'text-slate-400/50',
            optimizedProgress > 0 && optimizedProgress < 100 && 'animate-pulse',
          )}
        >
          {optimizedProgress > 0 && optimizedProgress < 100
            ? 'Optimizing...'
            : 'Optimized'}
        </div>
      </div>
    </div>
  );
};

export { JobLeadProgressTracker };
