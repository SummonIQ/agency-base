import type { Metadata } from 'next';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadMoreBlock } from '@/components/ui/read-more-block';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  description: 'View job details',
  title: 'Job Details | gimmejob',
};

export default function JobListingDetailsLoadingPage() {
  return (
    <>
      <div className="flex h-[52px] items-center justify-between space-x-3 md:items-center md:space-x-6">
        <div className="flex flex-col space-y-2">
          <h1 className="flex space-x-2 text-2xl font-semibold leading-none tracking-tight">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </h1>

          <div className="flex flex-col space-y-2 md:flex-row md:flex-wrap md:space-x-6 md:space-y-0">
            <div className="flex items-center text-sm text-muted-foreground/70">
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border/30 drop-shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between space-y-4 border-b-border/50 bg-accent/30 opacity-40 sm:flex-row sm:items-center sm:space-y-0">
          <div className="flex flex-col">
            <CardTitle className="opacity-50">Job Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-col p-0">
          <dl className="grid grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                Description
              </dt>

              <ReadMoreBlock className="text-pretty text-sm/6 tracking-wide text-foreground [&>button]:opacity-50">
                <dd className="flex flex-col space-y-3">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-6 w-52" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-72" />
                </dd>
              </ReadMoreBlock>
            </div>

            <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5 ">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Company
              </dt>
              <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                <Skeleton className="mr-3 size-12 max-h-24 rounded-sm" />

                <span>
                  <Skeleton className="h-6 w-32" />
                </span>
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Location
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-48" />
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Salary
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-48" />
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Remote
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-12" />
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Job board
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-32" />
              </dd>
            </div>

            <div className="border-b border-border p-4 sm:col-span-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                URL
              </dt>
              <dd className="mt-1 truncate text-sm/6 sm:mt-2">
                <Link
                  className="text-primary underline underline-offset-2"
                  href="https://www.google.com"
                >
                  <Skeleton className="h-6 w-56" />
                </Link>
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Health Insurance
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-12" />
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Dental Coverage
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-12" />
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Paid Time Off
              </dt>
              <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                <Skeleton className="h-6 w-12" />
              </dd>
            </div>

            <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Requirements
              </dt>
              <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                <ul className="space-y-1">
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>

                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                </ul>
              </dd>
            </div>

            <div className="border-b border-border/60 p-4 sm:col-span-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Responsibilities
              </dt>
              <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                <ul className="space-y-1">
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                </ul>
              </dd>
            </div>

            <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Qualifications
              </dt>
              <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                <ul className="space-y-1">
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                </ul>
              </dd>
            </div>

            <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Benefits
              </dt>
              <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                <ul className="space-y-1">
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                  <li className="text-pretty text-xs/5">
                    <Skeleton className="h-6 w-48" />
                  </li>
                </ul>
              </dd>
            </div>

            <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
              <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80 opacity-50">
                Apply Options
              </dt>
              <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                <ul className="space-y-1">
                  <li className="flex-col space-y-3 text-pretty text-xs/5">
                    <Skeleton className="h-7 w-32" />

                    <Link
                      className="block truncate text-primary underline underline-offset-2"
                      href={'https://www.linkedin.com'}
                    >
                      <Skeleton className="h-6 w-72" />
                    </Link>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </>
  );
}
