'use client';

import type { ResumeRevision, ScrapeJob } from '@prisma/client';
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Badge } from '../ui/badge';
import { DataTable } from '../ui/data-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';

export function ResumeRevisionsReport({
  defaultRevisionId,
  revisions = [],
  showColumnVisibility = false,
  showExport = false,
  showPagination = true,
  showSearch = true,
  showSelectedCount = false,
}: {
  defaultRevisionId?: string;
  revisions?: Array<ResumeRevision>;
  showColumnVisibility?: boolean;
  showExport?: boolean;
  showPagination?: boolean;
  showSearch?: boolean;
  showSelectedCount?: boolean;
}) {
  const columns: Array<ColumnDef<ScrapeJob>> = [
    {
      accessorKey: 'id',
      enableHiding: false,
    },
    {
      accessorKey: 'resumeId',
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      cell({ row }) {
        return (
          <div className="flex w-full items-center pl-3 font-medium">
            <Link
              className="group flex flex-row items-center space-x-4"
              href={`/profile/resumes/${row.getValue('resumeId')}/revisions/${row.getValue('id')}`}
            >
              <div className="flex flex-col space-y-0.5">
                <h4 className="text-sm font-semibold underline-offset-4 group-hover:underline">
                  {row.getValue('name')}

                  {row.original.id === defaultRevisionId && (
                    <Badge className="ml-2" variant="default">
                      Default
                    </Badge>
                  )}
                </h4>

                {/* <p className="text-xs font-light text-muted-foreground">
                  {row.getValue("company")}
                </p> */}
              </div>
            </Link>
          </div>
        );
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          style={{
            width: column.getSize(),
          }}
          title="Name"
        />
      ),
      id: 'name',
      // maxSize: 400,
      // size: 120,
    },
    {
      accessorKey: 'createdAt',
      cell({ row }) {
        const createdAt = new Date(
          row.getValue('createdAt'),
        ).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        return (
          <div className="flex w-full items-center pl-3 text-center">
            {createdAt}
          </div>
        );
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          className="text-center"
          column={column}
          style={{
            width: column.getSize(),
          }}
          title="Upload Date"
        />
      ),
      id: 'createdAt',
    },
    // {
    //   accessorKey: 'pages',
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: 'endedAt',
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: 'completedAt',
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: 'completedPages',
    //   enableHiding: false,
    // },
    // {
    //   accessorKey: 'completedAt',
    //   cell({ row }) {
    //     const totalPages = row.getValue('pages') as number;
    //     const completedPages = row.getValue('completedPages') as number;
    //     const completedAt = row.getValue('completedAt') as Date;
    //     const completedPagesPercent = Math.round(
    //       (completedPages / totalPages) * 100,
    //     );
    //     const endedAt = row.getValue('endedAt') as Date;

    //     return (
    //       <div className="flex w-full items-center pl-3 text-center">
    //         {completedAt ? (
    //           <Badge className="bg-green-500/80 text-white" variant="default">
    //             Completed
    //           </Badge>
    //         ) : !endedAt ? (
    //           <Badge className="bg-red-500/80" variant="destructive">
    //             Error
    //           </Badge>
    //         ) : (
    //           <>
    //             {completedPagesPercent > 0 ? (
    //               <Badge variant="outline">{completedPagesPercent}%</Badge>
    //             ) : (
    //               <>{completedPagesPercent}%</>
    //             )}
    //           </>
    //         )}
    //       </div>
    //     );
    //   },
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       className="text-center"
    //       column={column}
    //       style={{
    //         width: column.getSize(),
    //       }}
    //       title="Status"
    //     />
    //   ),
    //   id: 'status',
    //   maxSize: 120,
    //   size: 120,
    // },
    // {
    //   accessorKey: 'jobListings',
    //   cell({ row }) {
    //     const jobListings = row.getValue('jobListings') as Array<JobListing>;
    //     return (
    //       <div className="flex w-full items-center pl-3 text-center">
    //         {jobListings.length}
    //       </div>
    //     );
    //   },
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       className="text-center"
    //       column={column}
    //       style={{
    //         width: column.getSize(),
    //       }}
    //       title="Job Listings"
    //     />
    //   ),
    //   id: 'jobListings',
    //   maxSize: 120,
    //   size: 120,
    // },

    {
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="size-8 p-0" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
              // onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Delete
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      id: 'actions',
      maxSize: 64,
      size: 64,
      // maxSize: 120,
      // size: 120,
    },
  ];

  return (
    <DataTable
      columnVisibility={{
        id: false,
        resumeId: false,
      }}
      columns={columns}
      data={revisions}
      searchField="name"
      searchPlaceholder="Search revisions..."
      showColumnVisibility={false}
      showExport={showExport}
      showPagination={showPagination}
      showSearch={true}
      showSelectedCount={showSelectedCount}
    />
  );
}
