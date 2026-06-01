'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useEvent } from '@/hooks/use-event';
import { useUserChannel } from '@/hooks/use-user-channel';
import { cn } from '@/lib/css';
import { EventType } from '@/types/events';
import { DataEventType } from '@/types/events/data-update';
import type { JobLeadOptimizationProgressPayload } from '@/types/job-lead/event';
import { JobLeadStatus } from '@prisma/client';
export type JobLeadProgressProps = {
  status: JobLeadStatus;
};

export function JobLeadProgress({ status }: JobLeadProgressProps) {
  return (
    <div className="mb-4 flex w-full items-center gap-x-2 rounded-md border border-border/70 p-5 pb-8 shadow-sm drop-shadow-lg">
      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full',
            status === JobLeadStatus.APPLIED
              ? 'bg-yellow-400'
              : 'bg-gray-400/30',
          )}
        />

        <div
          className={cn(
            'absolute top-full pt-1.5 text-xs font-semibold',
            status === JobLeadStatus.APPLIED
              ? 'text-yellow-400'
              : 'text-gray-400',
          )}
        >
          Applied
        </div>
      </div>

      <div
        className={cn(
          'h-1.5 w-1/3 rounded-full bg-gradient-to-r from-10%',
          status === JobLeadStatus.APPLIED
            ? 'from-yellow-400/30'
            : 'from-gray-400/30',
          status === JobLeadStatus.INTERVIEW_SCHEDULED
            ? 'to-orange-400/50'
            : 'to-gray-400/30',
        )}
      />

      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full bg-blue-400',
            status === JobLeadStatus.INTERVIEW_SCHEDULED
              ? 'bg-orange-400'
              : 'bg-gray-400/30',
          )}
        />

        <div
          className={cn(
            'absolute left-0.5 top-full pt-1.5 text-xs font-semibold text-nowrap',
            status === JobLeadStatus.INTERVIEW_SCHEDULED
              ? 'text-orange-400'
              : 'text-gray-400/70',
          )}
        >
          Interview Scheduled
        </div>
      </div>

      <div
        className={cn(
          'h-1.5 w-1/3 rounded-full bg-gradient-to-r from-10%',
          status === JobLeadStatus.INTERVIEW_SCHEDULED
            ? 'from-orange-400/40'
            : 'from-gray-400/30',
          status === JobLeadStatus.INTERVIEWED
            ? 'to-blue-400/30'
            : 'to-gray-400/30',
        )}
      />

      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full',
            status === JobLeadStatus.INTERVIEWED
              ? 'bg-blue-400'
              : 'bg-gray-400/30',
          )}
        />

        <div
          className={cn(
            'absolute left-0 top-full pt-1.5 text-xs font-semibold',
            status === JobLeadStatus.INTERVIEWED
              ? 'text-blue-400'
              : 'text-gray-400/70',
          )}
        >
          Interviewed
        </div>
      </div>

      <div
        className={cn(
          'h-1.5 w-1/3 rounded-full bg-gradient-to-r from-0%',
          status === JobLeadStatus.INTERVIEWED
            ? 'from-green-400/20  '
            : 'from-gray-400/30',
          status === JobLeadStatus.OFFER_MADE
            ? 'to-primary/30'
            : 'to-gray-400/30',
        )}
      />

      <div className="relative flex flex-col gap-y-1">
        <div
          className={cn(
            'flex size-3 shrink-0 rounded-full bg-primary',
            status === JobLeadStatus.OFFER_MADE
              ? 'bg-primary'
              : 'bg-gray-400/30',
          )}
        />

        <div
          className={cn(
            'absolute right-0 top-full pt-1.5 text-xs font-semibold text-nowrap',
            status === JobLeadStatus.OFFER_MADE
              ? 'text-primary'
              : 'text-gray-400/70',
          )}
        >
          Offer Made
        </div>
      </div>
    </div>
  );
}
