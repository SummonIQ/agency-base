'use client';

import { JobListing, Prisma } from '@prisma/client';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { CheckCircle, StarIcon, TrashIcon } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Report } from '@/components/data/report';
import { BulkJobListingActionBar } from '@/components/job-listings/job-listings-bulk-action-bar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEvent } from '@/hooks/use-event';
import { useUserChannel } from '@/hooks/use-user-channel';
import { DataEventType, EventType } from '@/types/events';
import { JobSearchProgressPayload } from '@/types/job-search';
import { ApiQuery, Filter, Pagination, Sort } from '@/types/reporting/query';
import { ReportColumn } from '@/types/reporting/report';

import { JobListingStatusBadge } from './job-listing-status-badge';
export const DateLabel = dynamic(
  () => import('@/components/data/date-label').then(mod => mod.DateLabel),
  { ssr: false },
);

export function JobListingsReport({
  addToLeads,
  cacheKey,
  dismiss,
  initialData,
  initialQuery,
  pagination,
  save,
  showExport = true,
  showPagination = true,
  showSearch = true,
  showSelectedCount = false,
  showColumnToggle = true,
  undismiss,
  unsave,
  sort = [{ direction: 'desc', field: 'createdAt' }],
  filters,
  totalCount,
}: {
  addToLeads?: (ids: string[]) => Promise<void>;
  cacheKey?: string;
  dismiss?: (ids: string[]) => Promise<void>;
  filters?: Array<Filter<JobListing>>;
  initialData?: Array<JobListing>;
  initialQuery?: ApiQuery<JobListing, Prisma.JobListingInclude>;
  pagination?: Pagination;
  save?: (ids: string[]) => Promise<void>;
  showColumnToggle?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelectedCount?: boolean;
  sort?: Array<Sort<JobListing>>;
  undismiss?: (ids: string[]) => Promise<void>;
  unsave?: (ids: string[]) => Promise<void>;
  totalCount?: number;
}) {
  const router = useRouter();
  const userChannel = useUserChannel();
  const [selectedRows, setSelectedRows] = useState<Record<string, JobListing>>(
    {},
  );

  useEvent<{
    data: JobSearchProgressPayload;
    type: DataEventType.JOB_SEARCH_PROGRESS;
  }>(userChannel, EventType.DataUpdate, async payload => {
    if (!payload) return;

    console.log('payload', payload);
    const { id, progress, status, searchTerm } = payload.data;

    if (progress >= 100) {
      router.refresh();
    }
  });

  const columns: Array<ReportColumn<JobListing>> = [
    {
      align: 'left',
      cellFn: ({ id, saved, description, title }) => (
        <Link
          className="group relative flex flex-row items-center hover:before:bg-border/50"
          href={`/jobs/${id}`}
        >
          <div className="flex flex-col justify-start space-y-0.5">
            <h4 className="line-clamp-1 space-x-1.5 text-sm underline-offset-2 group-hover:underline">
              {saved && (
                <StarFilledIcon className="inline-block size-4 -translate-y-px text-yellow-500" />
              )}
              <span className="font-semibold">{title}</span>
            </h4>
            <p className="line-clamp-2 text-sm font-light text-muted-foreground">
              {description && description.length > 220
                ? `${description.slice(0, 220)}...`
                : description}
            </p>
          </div>
        </Link>
      ),
      className: 'min-w-[300px] md:min-w-[420px]',
      header: 'Title',
      key: 'title',
      sortable: true,
      visible: true,
    },
    {
      align: 'left',
      cellFn: ({ company }) => (
        <p className="line-clamp-3 text-xs">{company}</p>
      ),
      className: 'min-w-28 md:min-w-40',
      header: 'Company',
      key: 'company',
      sortable: true,
      visible: true,
    },
    {
      align: 'left',
      cellFn: ({ status }) => {
        return (
          <JobListingStatusBadge
            status={status ?? undefined}
            variant="outline"
          />
        );
      },
      className: 'min-w-32 md:min-w-36',
      header: 'Status',
      sortable: false,
      visible: true,
    },
    {
      align: 'left',
      cellFn: row => (
        <p className="text-xs font-light leading-relaxed text-muted-foreground">
          <DateLabel date={new Date(row.createdAt)} variant="relative" />
        </p>
      ),
      className: 'min-w-16 md:min-w-24',
      header: 'Added',
      key: 'createdAt',
      sortable: true,
      visible: true,
    },
    {
      align: 'center',
      cellFn: () => (
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
            <DropdownMenuItem className="cursor-pointer items-center text-green-500 hover:!bg-green-500/40 hover:!text-green-600">
              <CheckCircle className="size-4" />
              <span className="text-xs font-semibold">Add Lead</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer items-center text-red-500 hover:!bg-red-500/40 hover:!text-red-600">
              <TrashIcon className="size-4" />
              <span className="text-xs font-semibold">Dismiss</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer items-center text-yellow-500 hover:!bg-yellow-500/40 hover:!text-yellow-600">
              <StarIcon className="size-4" />
              <span className="text-xs font-semibold">Save</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'min-w-36 max-w-36 text-center',
      header: 'Actions',
      sortable: false,
      visible: true,
    },
  ];

  return (
    <>
      <Report<JobListing, Prisma.JobListingInclude>
        cacheKey={cacheKey}
        columns={columns}
        enableRowSelection={true}
        initialData={initialData}
        initialQuery={initialQuery}
        model="job-listings"
        onSelectedRowsChange={setSelectedRows}
        searchField="title"
        searchPlaceholder="Search job listings..."
        selectedRows={selectedRows}
        showColumnToggle={showColumnToggle}
        showExport={showExport}
        showPagination={showPagination}
        showSearch={showSearch}
        showSelectedCount={showSelectedCount}
        totalCount={totalCount}
      />

      <BulkJobListingActionBar
        addToLeads={addToLeads}
        dismiss={dismiss}
        resetSelectedJobs={() => setSelectedRows({})}
        save={save}
        selectedJobs={selectedRows}
        undismiss={undismiss}
        unsave={unsave}
      />
    </>
  );
}
