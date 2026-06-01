'use client';

import {
  JobFitAnalysis,
  type JobLead,
  JobListing,
  Prisma,
  ResumeOptimization,
  ResumeRevision,
} from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import { TrashIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';

import { Report } from '@/components/data/report';
import { JobLeadsBulkActionBar } from '@/components/job-leads/job-leads-bulk-action-bar';
import { ResumeOptimizationStatusBadge } from '@/components/resumes/resume-optimization-status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiQuery, Sort } from '@/types/reporting/query';
import { Pagination } from '@/types/reporting/query';
import { ReportColumn } from '@/types/reporting/report';

import { JobLeadStatusBadge } from './job-lead-status-badge';

export const DateLabel = dynamic(
  () => import('@/components/data/date-label').then(mod => mod.DateLabel),
  { ssr: false },
);

/*
  useEvent<{
    data: JobLeadAnalysisProgressPayload;
    type: DataEventType.JOB_LEAD_OPTIMIZATION_PROGRESS;
  }>(userChannel, EventType.DataUpdate, payload => {
    if (!payload) return;

    // const { id, progress } = payload.data;

    // startTransition(async () => {
    //   if (progress >= 100) {
    //     setTimeout(() => {
    //       setQueue(prev => {
    //         const newQueue = { ...prev };
    //         delete newQueue[id];
    //         return newQueue;
    //       });
    //     }, 3000);
    //   } else if (
    //     (queue[id]?.progress && progress > queue[id]?.progress) ||
    //     !queue[id]?.progress
    //   ) {
    //     setQueue(prev => ({
    //       ...prev,
    //       [id]: {
    //         progress,
    //       },
    //     }));
    //   }

    //   router.refresh();
    // });
  });
*/

const JobLeadsReport = ({
  dismiss,
  initialData,
  initialQuery,
  cacheKey,
  showExport = false,
  showPagination = false,
  showSearch = true,
  showSelectedCount = true,
  showColumnToggle = true,
}: {
  cacheKey?: string;
  dismiss?: (ids: Array<string>) => Promise<void>;
  initialData?: Array<
    JobLead & {
      jobFitAnalysis: JobFitAnalysis;
      jobListing: JobListing;
      resumeRevisions: Array<
        ResumeRevision & { optimization: ResumeOptimization }
      >;
    }
  >;
  initialQuery?: ApiQuery<JobLead, Prisma.JobLeadInclude>;
  pagination?: Pagination;
  showColumnToggle?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelectedCount?: boolean;
  sort?: Array<Sort<JobLead>>;
}) => {
  const [selectedRows, setSelectedRows] = useState<
    Record<
      string,
      JobLead & {
        jobFitAnalysis: JobFitAnalysis;
        jobListing: JobListing;
        resumeRevisions: Array<
          ResumeRevision & { optimization: ResumeOptimization }
        >;
      }
    >
  >({});

  const columns: Array<
    ReportColumn<
      JobLead & {
        jobFitAnalysis: JobFitAnalysis;
        jobListing: JobListing;
        optimization: Array<
          ResumeOptimization & { resumeRevisions: Array<ResumeRevision> }
        >;
      }
    >
  > = [
    {
      cellFn: ({ title, id, jobListing }) => {
        return (
          <div className="flex size-full grow items-start px-3">
            <Link
              className="group flex flex-row items-center"
              href={`/leads/${id}`}
            >
              <div className="flex flex-col justify-start gap-y-0.5">
                <h4 className="line-clamp-1 text-sm font-semibold underline-offset-2 group-hover:underline">
                  {title}
                </h4>

                <p className="line-clamp-2 text-sm font-light text-muted-foreground">
                  {jobListing?.description
                    ? `${jobListing.description?.slice(0, 220)}...`
                    : jobListing?.description}
                </p>
              </div>
            </Link>
          </div>
        );
      },
      className: 'min-w-[300px] md:min-w-[420px]',
      header: 'Title',
      key: 'title',
      sortable: true,
      visible: true,
    },
    {
      align: 'left',
      cellFn: ({ jobListing }) => {
        return (
          <div className="flex w-full items-center px-3">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              {jobListing?.company}
            </p>
          </div>
        );
      },
      className: 'min-w-28 md:min-w-40',
      header: 'Company',
      sortable: true,
      visible: true,
    },
    {
      align: 'left',
      cellFn: ({ jobFitAnalysis }) => {
        return (
          <div className="flex w-full items-center px-3">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              {jobFitAnalysis?.overallMatchScore}
            </p>
          </div>
        );
      },
      className: 'min-w-28 md:min-w-40',
      header: 'Job Fit Score',
      sortable: true,
      visible: true,
    },
    {
      align: 'left',
      cellFn: ({ status }) => {
        return (
          <div className="flex items-center pl-3 text-center">
            <JobLeadStatusBadge status={status} />
          </div>
        );
      },
      className: 'min-w-28 md:min-w-40',
      header: 'Status',
      key: 'status',
      sortable: true,
      visible: true,
    },
    {
      align: 'left',
      cellFn: ({ status, optimization }) => {
        if (!optimization) return null;
        return (
          <div className="flex items-center pl-3 text-center">
            <ResumeOptimizationStatusBadge status={optimization.status} />
          </div>
        );
      },
      className: 'min-w-28 md:min-w-40',
      header: 'Optimization Status',
      key: 'optimization',
      sortable: true,
      visible: true,
    },

    {
      align: 'left',
      cellFn: ({ createdAt }) => (
        <p className="text-xs font-light leading-relaxed text-muted-foreground">
          <DateLabel date={createdAt} variant="relative" />
        </p>
      ),
      className: 'min-w-16 md:min-w-24',
      header: 'Added',
      key: 'createdAt',
      sortable: true,
      visible: true,
    },
    {
      cellFn: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="size-8 rounded-full border border-border/30 p-2 hover:border-border hover:bg-background"
                variant="ghost"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem className="cursor-pointer items-center text-green-500 hover:!bg-green-500/40 hover:!text-green-600">
            <CheckCircle className="size-4" />
            <span className="text-xs font-semibold">Shortlist</span>
          </DropdownMenuItem> */}

              <DropdownMenuItem className="cursor-pointer items-center text-red-500 hover:!bg-red-500/40 hover:!text-red-600">
                <TrashIcon className="size-4" />
                <span className="text-xs font-semibold">Dismiss</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              {/* 
          <DropdownMenuItem className="cursor-pointer items-center text-yellow-500 hover:!bg-yellow-500/40 hover:!text-yellow-600">
            <StarIcon className="size-4" />
            <span className="text-xs font-semibold">Save</span>
          </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      className: 'min-w-20 md:min-w-28',
      header: 'Actions',
      sortable: false,
      visible: true,
    },
  ];
  // const [queue, setQueue] = useState<
  //   Record<
  //     string,
  //     {
  //       progress: number;
  //     }
  //   >
  // >({});
  // const [isPending, startTransition] = useTransition();
  // const router = useRouter();

  // const userChannel = useUserChannel();

  return (
    <>
      <Report<JobLead, Prisma.JobLeadInclude>
        cacheKey={cacheKey}
        columns={columns}
        enableRowSelection={true}
        initialData={initialData}
        initialQuery={initialQuery}
        model="job-leads"
        onSelectedRowsChange={setSelectedRows}
        searchField="title"
        searchPlaceholder="Search leads..."
        selectedRows={selectedRows}
        showColumnToggle={showColumnToggle}
        showExport={showExport}
        showPagination={showPagination}
        showSearch={showSearch}
        showSelectedCount={showSelectedCount}
      />
      {/* 
      <DataTable
        columnVisibility={{
          description: false,
          id: false,
        }}
        columns={columns}
        data={jobLeads}
        onRowSelectionChange={setRowSelection}
        searchField={searchField}
        searchPlaceholder="Search leads..."
        showColumnVisibility={true}
        showExport={showExport}
        showPagination={showPagination}
        showSearch={showSearch}
        showSelectedCount={showSelectedCount}
      /> */}

      <JobLeadsBulkActionBar
        dismiss={dismiss}
        resetSelectedJobs={() => setSelectedRows({})}
        selectedJobLeads={selectedRows}
      />
      {/* <BulkJobListingActionBar selectedJobs={rowSelection} /> */}
    </>
  );
};
JobLeadsReport.displayName = 'JobLeadsReport';

export { JobLeadsReport };
