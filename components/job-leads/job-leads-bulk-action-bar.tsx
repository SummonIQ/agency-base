'use client';

import type { JobLead } from '@prisma/client';
import { ChevronUp, Replace, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Portal } from 'radix-ui';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/css';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface JobLeadsBulkActionBarProps {
  dismiss?: (ids: Array<string>) => Promise<void>;
  resetSelectedJobs?: () => void;
  selectedJobLeads: Record<string, JobLead>;
}

const JobLeadsBulkActionBar = ({
  dismiss,
  selectedJobLeads = {},
  resetSelectedJobs,
}: JobLeadsBulkActionBarProps) => {
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isDismissing, startDismissTransition] = useTransition();
  const router = useRouter();

  const hasRowSelections = Object.keys(selectedJobLeads).length > 0;

  const handleDismiss = async () => {
    if (dismiss) {
      startDismissTransition(async () => {
        await dismiss(Object.keys(selectedJobLeads));

        setTimeout(() => {
          router.refresh();
        }, 1500);

        resetSelectedJobs?.();
      });
    }
  };

  return (
    <Portal.Root>
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex flex-row justify-center p-3',
          hasRowSelections ? 'pointer-events-all' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'mx-auto flex rounded-md border border-border/50 bg-accent/10 p-1 shadow-md shadow-foreground/20 drop-shadow-xl backdrop-blur-lg data-[state=closed]:duration-500 data-[state=open]:duration-300',
            'data-[state=closed]:translate-y-[200%] data-[state=closed]:scale-0 data-[state=closed]:opacity-0',
            'data-[state=open]:translate-y-[-20%] data-[state=open]:scale-100 data-[state=open]:opacity-100',
          )}
          data-state={hasRowSelections ? 'open' : 'closed'}
        >
          <div className="flex grow rounded-sm border border-border bg-background/80 py-2 shadow-sm shadow-foreground/5 drop-shadow-sm backdrop-blur-lg">
            <div className="flex grow items-center border-r border-border px-4">
              <span className="text-sm md:text-xs">
                <span className="font-semibold text-foreground">
                  {Object.keys(selectedJobLeads).length}{' '}
                  <span className="font-medium text-muted-foreground">
                    selected
                  </span>
                </span>
              </span>
            </div>

            <div className="px-2 md:hidden">
              <DropdownMenu
                modal={false}
                onOpenChange={setActionsMenuOpen}
                open={actionsMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-8 text-sm font-semibold text-foreground/75"
                    onMouseEnter={() => setActionsMenuOpen(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Replace className="!size-3.5" />
                    Actions
                    <ChevronUp className="ml-2 size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  onMouseLeave={() => setActionsMenuOpen(false)}
                >
                  <DropdownMenuItem
                    className="cursor-pointer text-sm font-semibold text-red-500 hover:!bg-red-500/90 hover:!text-white"
                    onClick={handleDismiss}
                  >
                    <TrashIcon className="!size-3.5" />
                    <span>
                      Dismiss ({Object.keys(selectedJobLeads).length})
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden flex-col space-y-1.5 border-l border-l-border/30 md:flex md:flex-row md:space-y-0">
              <div className="space-x-1.5 px-2 pb-2 md:px-2 md:pb-0">
                <Button
                  className="space-x-0 text-red-500 shadow-sm shadow-red-300/0 drop-shadow-sm transition-all duration-300 hover:border-red-500/30 hover:bg-red-500 hover:text-red-50 hover:shadow-lg hover:shadow-red-300/60"
                  disabled={!dismiss}
                  onClick={handleDismiss}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <TrashIcon className="!size-3.5" />
                  <span className="text-xs font-semibold">
                    Dismiss ({Object.keys(selectedJobLeads).length})
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal.Root>
  );
};

JobLeadsBulkActionBar.displayName = 'JobLeadsBulkActionBar';

export { JobLeadsBulkActionBar };
