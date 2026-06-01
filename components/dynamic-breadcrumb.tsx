'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useMediaQuery } from '@/hooks/use-media-query';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Define breadcrumb mapping with dynamic placeholders
export const breadcrumbMapping: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Job Listings',
  '/jobs/[id]': 'Job Details',
  '/jobs/dismissed': 'Dismissed',
  '/jobs/saved': 'Saved',
  '/leads': 'Job Leads',
  '/leads/[id]': 'Job Lead Details',
  '/profile': 'Profile',
  '/profile/resumes': 'Resumes',
  '/profile/resumes/[id]': 'Resume Details',
  '/profile/resumes/[id]/revisions': 'Resume Revisions',
  '/profile/resumes/[id]/revisions/[revisionId]': 'Revision Details',
  '/settings': 'Settings',
  '/settings/account': 'Account',
  '/settings/appearance': 'Appearance',
  '/tools': 'Tools',
  '/tools/ats-optimizer': 'ATS Optimizer',
  '/tools/job-details-optimizer': 'Job Details Optimizer',
  '/tools/job-scraper': 'Job Scraper',
  '/tools/job-scraper/[id]': 'Job Scraper Details',
};

// Function to match a URL to a breadcrumb name
const getBreadcrumbName = (href: string) => {
  // Loop through breadcrumbMapping to find a match
  for (const [key, name] of Object.entries(breadcrumbMapping)) {
    // Convert the dynamic segments in the key (e.g., "[id]") to a regex pattern
    const pattern = new RegExp(`^${key.replace(/\[.*?\]/g, '[^/]+')}$`);
    if (pattern.test(href)) {
      return name;
    }
  }
  // Fallback: return the last part of the path if no match is found
  return href.split('/').pop() || 'Unknown';
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pathParts = pathname.split('/').filter(Boolean);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop === null) {
    return null;
  }

  // Build breadcrumbs based on the current path.
  // (These come from the dynamic parts of the URL, not including the Home link.)
  const breadcrumbs = pathParts.map((_, index) => {
    const href = `/${pathParts.slice(0, index + 1).join('/')}`;
    return {
      href,
      name: getBreadcrumbName(href),
    };
  });

  // Set a threshold for how many breadcrumbs should appear inline.
  // On desktop we can show more; on mobile we show fewer.
  const ITEMS_TO_DISPLAY = isDesktop ? 5 : 3;

  // If there are more breadcrumbs than allowed, collapse the intermediate items.
  const shouldCollapse = breadcrumbs.length > ITEMS_TO_DISPLAY;
  // On mobile, collapse everything between the first and last.
  // On desktop, leave one extra item visible (if available).
  const collapsedItems = isDesktop
    ? breadcrumbs.slice(1, -2)
    : breadcrumbs.slice(1, -1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* <Separator className="ml-1 mr-2 h-4" orientation="vertical" /> */}

        {shouldCollapse ? (
          <Fragment>
            {/* {pathname !== '/dashboard' && <BreadcrumbSeparator />} */}

            <BreadcrumbItem>
              <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
                <DropdownMenuTrigger
                  aria-label="Toggle menu"
                  className="flex items-center gap-1"
                >
                  <BreadcrumbEllipsis className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {collapsedItems.length > 0 ? (
                    collapsedItems.map((item, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      <DropdownMenuItem key={i}>
                        <Link href={item.href}>{item.name}</Link>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    // In case collapsedItems is empty, render a fallback.
                    <DropdownMenuItem disabled>No items</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  className="text-muted-foreground"
                  href={breadcrumbs[breadcrumbs.length - 1].href}
                >
                  {breadcrumbs[breadcrumbs.length - 1].name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ) : (
          // Render all breadcrumbs inline if we don't need to collapse them
          breadcrumbs.map((crumb, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Yolo
            <Fragment key={i}>
              {i !== 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {i === breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <span className="text-foreground">{crumb.name}</span>
                  </BreadcrumbLink>
                ) : crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.name}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{crumb.name}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
