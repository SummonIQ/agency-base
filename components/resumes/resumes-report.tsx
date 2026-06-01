'use client';

import { Prisma, type Resume, ResumeOptimizationStatus } from '@prisma/client';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { MoreHorizontal, Trash } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';

import { Report } from '@/components/data/report';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEvent } from '@/hooks/use-event';
import { useUserChannel } from '@/hooks/use-user-channel';
import { QueueState } from '@/types/data';
import type {
  WithOptionalResumeAnalysis,
  WithOptionalResumeOptimization,
  WithOptionalResumeRevisions,
} from '@/types/domain/resume';
import { DataEventType, EventType } from '@/types/events';
import { ApiQuery } from '@/types/reporting/query';
import { ReportColumn } from '@/types/reporting/report';
import { ResumeOptimizationProgressPayload } from '@/types/resumes/events';

import { ResumeOptimizationStatusBadge } from './resume-optimization-status-badge';
export const DateLabel = dynamic(
  () => import('@/components/data/date-label').then(mod => mod.DateLabel),
  { ssr: false },
);

export function ResumesReport({
  cacheKey,
  defaultResumeId,
  deleteResume,
  initialData,
  initialQuery,
  showColumnToggle = false,
  showExport = false,
  showPagination = true,
  showSearch = true,
  showSelectedCount = false,
}: {
  cacheKey?: string;
  defaultResumeId?: string;
  deleteResume: (resumeId: string) => Promise<void>;
  initialData?: Array<
    WithOptionalResumeOptimization<WithOptionalResumeAnalysis<Resume>>
  >;
  initialQuery?: ApiQuery<Resume, Prisma.ResumeInclude>;
  showColumnToggle?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelectedCount?: boolean;
}) {
  const router = useRouter();
  const userChannel = useUserChannel();
  const [queue, setQueue] = useState<QueueState<ResumeOptimizationStatus>>(
    initialData
      ?.filter(resume => resume.optimization?.progress !== 100)
      .reduce((acc, resume) => {
        acc[resume.id as string] = {
          createdAt: resume.createdAt,
          name: resume?.name ?? '',
          progress: resume.optimization?.progress ?? 0,
          status:
            resume.optimization?.status ?? ResumeOptimizationStatus.QUEUED,
          updatedAt: resume.updatedAt,
        };
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
      startTransition(async () => {
        // delete the queue item
        setQueue(prev => {
          const newQueue = { ...prev };
          delete newQueue[id];
          return newQueue;
        });
      });
    } else {
      startTransition(async () => {
        setQueue(prev => {
          const newQueue = { ...prev };
          newQueue[id] = {
            ...newQueue[id],
            name,
            progress,
            status,
            updatedAt: new Date(),
          };

          return newQueue;
        });
      });
    }

    router.refresh();
  });

  const columns: Array<
    ReportColumn<
      WithOptionalResumeAnalysis<
        WithOptionalResumeOptimization<WithOptionalResumeRevisions<Resume>>
      >
    >
  > = [
    {
      align: 'left',
      cellFn: ({ name, id }) => {
        return (
          <Link
            className="group flex flex-row items-center"
            href={`/profile/resumes/${id}`}
          >
            <h4 className="flex items-center gap-0 text-sm font-semibold underline-offset-4">
              <span className="flex items-center group-hover:underline">
                {name}
              </span>

              {id === defaultResumeId && (
                <Badge
                  className="ml-3 gap-x-1 rounded-md border-none bg-yellow-500/10 px-2 py-1 "
                  variant="outline"
                >
                  <StarFilledIcon className="size-[14px] text-yellow-500/70" />
                  <span className="font-bold leading-normal tracking-normal text-yellow-500/85">
                    Default
                  </span>
                </Badge>
              )}
            </h4>
          </Link>
        );
      },
      className: 'max-w-[200px] md:max-w-[220px]',
      header: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      align: 'center',
      cellFn: ({ analysis }) => {
        return (
          <div className="flex w-full items-center font-mono font-semibold">
            {analysis?.score ? (
              <div className="flex items-center gap-0.5 text-center">
                <span>{analysis.score}</span>
                <span className="text-muted-foreground/70">%</span>
              </div>
            ) : (
              <span className="text-center text-muted-foreground/70">N/A</span>
            )}
          </div>
        );
      },
      className: 'max-w-[120px]',
      header: 'Score',
      sortable: true,
    },
    {
      cellFn: ({ optimization }) => {
        return (
          <div className="flex w-full items-center font-mono font-semibold">
            {optimization?.score ? (
              <div className="flex items-center gap-0.5 text-center">
                <span>{optimization.score}</span>
                <span className="text-muted-foreground/70">%</span>
              </div>
            ) : (
              <span className="text-center text-muted-foreground/70">N/A</span>
            )}
          </div>
        );
      },
      className: 'max-w-[120px]',
      header: 'New Score',
      sortable: true,
    },
    {
      align: 'left',
      cellFn: ({ optimization, id }) => {
        const status = optimization?.status ?? ResumeOptimizationStatus.QUEUED;

        return (
          <ResumeOptimizationStatusBadge status={status} variant="outline" />
        );
      },
      className: 'min-w-[140px]',
      header: 'Status',
      sortable: true,
    },
    // {
    //   align: 'left',
    //   cellFn: ({ analysis, id }) => {
    //     const status = analysis?.status ?? ResumeAnalysisStatus.QUEUED;

    //     if (queue[id]) {
    //       const analysisProgress = queue[id];
    //       return (
    //         <div className="flex w-full flex-col justify-center space-y-0.5">
    //           <span className="flex flex-row items-center justify-between px-0.5 text-xs">
    //             <ResumeAnalysisStatusBadge status={status} />
    //             <span className="font-medium">
    //               {analysisProgress.progress}%
    //             </span>
    //           </span>
    //           <Progress
    //             className="h-2 [&>div]:bg-primary"
    //             value={analysisProgress.progress}
    //           />
    //         </div>
    //       );
    //     }

    //     return <ResumeAnalysisStatusBadge status={status} />;
    //   },
    //   className: 'min-w-[140px]',
    //   header: 'Analysis',
    //   sortable: true,
    // },

    {
      cellFn: ({ createdAt }) => {
        return (
          <p className="text-xs font-light leading-relaxed text-muted-foreground">
            <DateLabel date={createdAt} />
          </p>
        );
      },
      className: 'min-w-[120px] md:min-w-[160px]',
      header: 'Upload Date',
      key: 'createdAt',
      sortable: true,
    },

    {
      cellFn: ({ id }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-7 rounded-full p-0 hover:bg-foreground/10"
                variant="ghost"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs text-muted-foreground/50">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer text-xs font-bold text-primary hover:!bg-primary/10 hover:!text-primary"
                // onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                <StarFilledIcon className="size-4" />
                Set as default
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-xs font-bold text-red-500 hover:!bg-red-500/10 hover:!text-red-500"
                onClick={async () => {
                  await deleteResume(id);

                  router.refresh();
                }}
              >
                <Trash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      className: 'min-w-12 max-w-24 text-center',
      header: 'Actions',
      sortable: false,
      visible: true,
    },
  ];

  return (
    <Report<Resume, Prisma.ResumeInclude>
      cacheKey={cacheKey}
      columns={columns}
      initialData={initialData}
      initialQuery={initialQuery}
      model="resumes"
      searchField="name"
      searchPlaceholder="Search resumes..."
      showColumnToggle={showColumnToggle}
      showExport={showExport}
      showPagination={showPagination}
      showSearch={showSearch}
      showSelectedCount={showSelectedCount}
    />
  );
}
