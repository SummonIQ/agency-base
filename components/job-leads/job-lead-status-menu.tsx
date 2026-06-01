'use client';

import { ChevronDownIcon, Tags, Trash } from 'lucide-react';

import * as React from 'react';
import { ArrowUpCircle, Calendar, Check, XCircle } from 'lucide-react';

import { cn } from '@/lib/css';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { ChevronDownIcon } from 'lucide-react';
import { JobLeadStatus } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { JobLeadStatusBadge } from './job-lead-status-badge';

const jobLeadStatuses = [
  {
    label: 'Applied',
    value: JobLeadStatus.APPLIED,
  },
  {
    label: 'Interview Scheduled',
    value: JobLeadStatus.INTERVIEW_SCHEDULED,
  },
  {
    label: 'Interviewed',
    value: JobLeadStatus.INTERVIEWED,
  },
  {
    label: 'Offer Made',
    value: JobLeadStatus.OFFER_MADE,
  },
  {
    label: 'Offer Rejected',
    value: JobLeadStatus.OFFER_REJECTED,
  },
  {
    label: 'Offer Accepted',
    value: JobLeadStatus.OFFER_ACCEPTED,
  },
  {
    label: 'Rejected',
    value: JobLeadStatus.REJECTED,
  },
];

export interface JobLeadStatusMenuProps {
  action: (status: JobLeadStatus) => Promise<void>;
  status: JobLeadStatus;
}
export function JobLeadStatusMenu({
  status: initialStatus,
  action,
}: JobLeadStatusMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState(initialStatus);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <div className="text-sm flex flex-row items-center font-medium border-r border-border/60 pr-2">
              <span className="text-muted-foreground text-xs">Status:</span>
              <span className="text-foreground text-sm font-medium">
                <JobLeadStatusBadge variant="ghost" status={status} />
              </span>
            </div>
            <ChevronDownIcon className="h-3.5 w-3.5" size="sm" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuGroup className="p-0.5">
            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground"
                variant="ghost"
                status={JobLeadStatus.APPLIED}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground"
                variant="ghost"
                status={JobLeadStatus.INTERVIEW_SCHEDULED}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground"
                variant="ghost"
                status={JobLeadStatus.INTERVIEWED}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground"
                variant="ghost"
                status={JobLeadStatus.OFFER_MADE}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground"
                variant="ghost"
                status={JobLeadStatus.OFFER_ACCEPTED}
              />
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground"
                variant="ghost"
                status={JobLeadStatus.OFFER_REJECTED}
              />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer p-1 px-0.5 text-right justify-end">
              <JobLeadStatusBadge
                className="text-muted-foreground hover:text-reset"
                variant="ghost"
                status={JobLeadStatus.REJECTED}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

/*
 // <Popover open={open} onOpenChange={setOpen}>
    //   <PopoverTrigger asChild>
      
    //   </PopoverTrigger>

    //   <PopoverContent className="w-[200px] p-0">yoyoyo</PopoverContent>
      // </Popover>*/
