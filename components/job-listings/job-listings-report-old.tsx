'use client';

import { type JobListing, JobListingStatus } from '@prisma/client';
import { StarFilledIcon } from '@radix-ui/react-icons';
import type { ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle,
  EyeOff,
  MoreHorizontal,
  StarIcon,
  TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TbCancel } from 'react-icons/tb';

import { BulkJobListingActionBar } from '@/components/job-listings/job-listings-bulk-action-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DateLabel } from '../data/date-label';

export function JobListingsReport({
  addToLeads,
  card = false,
  columnVisibility,
  className,
  dismiss,
  jobs = [],
  save,
  showColumnVisibility = true,
  showExport = false,
  showPagination = false,
  initialSorting = [{ desc: true, id: 'createdAt' }],
  showSelectedCount = true,
  showSearch = true,
  searchField = 'title',
  enableRowSelection = true,
  unsave,
}: {
  addToLeads?: (ids: Array<string>) => Promise<void>;
  card?: boolean;
  className?: string;
  columnVisibility?: Record<string, boolean>;
  dismiss?: (ids: Array<string>) => Promise<JobListing>;
  enableRowSelection?: boolean;
  initialSorting?: Array<{ desc: boolean; id: string }>;
  jobs?: Array<JobListing & { saved: boolean }>;
  save?: (ids: Array<string>) => Promise<void>;
  searchField?: string;
  showColumnVisibility?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelectedCount?: boolean;
  unsave?: (ids: Array<string>) => Promise<void>;
}) {
  const [rowSelection, setRowSelection] = useState<Array<string>>([]);
  const router = useRouter();
  const columns: Array<ColumnDef<JobListing>> = [
    {
      // add an explicit id here
      accessorFn: (row: JobListing) => (
        <div className="flex items-center">
          <Checkbox aria-label="Select row" /* implement selection logic */ />
        </div>
      ),

      header: '',
      // Selection column (if you’re including this in your column definitions)
      id: 'select', // or you could put a header like "Select"
      sortable: false,
      visible: true,
    },
    {
      accessorFn: (row: JobListing) => (
        <div className="flex items-start px-3">
          <Link
            className="group relative flex flex-row items-center hover:before:bg-border/50"
            href={`/jobs/${row.id}`}
          >
            <div className="flex flex-col justify-start space-y-0.5">
              <h4 className="line-clamp-1 space-x-1.5 text-sm underline-offset-2 group-hover:underline">
                {row.saved && (
                  <StarFilledIcon className="inline-block size-4 -translate-y-px text-yellow-500" />
                )}
                <span className="font-semibold">{row.title}</span>
              </h4>
              <p className="line-clamp-2 text-sm font-light text-muted-foreground">
                {row.description && row.description.length > 220
                  ? `${row.description.slice(0, 220)}...`
                  : row.description}
              </p>
            </div>
          </Link>
        </div>
      ),
      header: 'Title',
      id: 'title',
      sortable: true,
      visible: true,
    },
    {
      accessorKey: 'company',
      header: 'Company',
      id: 'company',
      sortable: false,
      visible: true,
    },
    {
      accessorFn: (row: JobListing) => {
        const getBadge = (status: string) => {
          switch (status) {
            case JobListingStatus.DISMISSED:
              return (
                <Badge
                  className="space-x-1.5 rounded-md border-none bg-red-500/10 px-2 text-red-500/60"
                  variant="outline"
                >
                  <TbCancel className="size-3.5" />
                  <span>Dismissed</span>
                </Badge>
              );
            case JobListingStatus.ADDED_TO_LEADS:
              return <Badge className="rounded-md">Added to leads</Badge>;
            case JobListingStatus.UNREVIEWED:
              return (
                <Badge
                  className="space-x-1.5 rounded-md border-none bg-accent px-2 py-1.5 text-accent-foreground/50"
                  variant="outline"
                >
                  <EyeOff className="size-3.5" />
                  <span>Unreviewed</span>
                </Badge>
              );
            default:
              return status;
          }
        };
        return (
          <div className="flex items-center px-3">{getBadge(row.status)}</div>
        );
      },
      header: 'Status',
      id: 'status',
      sortable: false,
      visible: true,
    },
    {
      accessorFn: (row: JobListing) => (
        <div className="flex items-center px-3">
          <p className="text-xs font-light leading-relaxed text-muted-foreground">
            <DateLabel date={row.createdAt} variant="relative" />
          </p>
        </div>
      ),
      header: 'Added',
      id: 'createdAt',
      sortable: true,
      visible: true,
    },
    {
      accessorFn: (row: JobListing) => (
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
              <span className="text-xs font-semibold">Shortlist</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer items-center text-red-500 hover:!bg-red-500/40 hover:!text-red-600">
              <TrashIcon className="size-4" />
              <span className="text-xs font-semibold">dismiss</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer items-center text-yellow-500 hover:!bg-yellow-500/40 hover:!text-yellow-600">
              <StarIcon className="size-4" />
              <span className="text-xs font-semibold">Save</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      header: 'Actions',
      id: 'actions',
      sortable: false,
      visible: true,
    },
  ];

  return (
    <>
      <DataTable
        card={card}
        className={className}
        columnVisibility={{
          description: false,
          id: false,
          select: enableRowSelection,
          ...columnVisibility,
        }}
        columns={columns}
        data={jobs}
        initialSorting={initialSorting}
        onRowSelectionChange={setRowSelection}
        searchField={searchField}
        searchPlaceholder="Search jobs..."
        showColumnVisibility={showColumnVisibility}
        showExport={showExport}
        showPagination={showPagination}
        showSearch={showSearch}
        showSelectedCount={showSelectedCount}
      />

      <BulkJobListingActionBar
        addToLeads={addToLeads}
        dismiss={dismiss}
        onSetSelectedJobs={setRowSelection}
        save={async ids => {
          if (save) {
            await save(ids);

            router.refresh();
          }
        }}
        selectedJobs={jobs.filter(job => rowSelection.includes(job.id))}
        unsave={async ids => {
          if (unsave) {
            await unsave(ids);

            router.refresh();
          }
        }}
      />
    </>
  );
}
