'use client';

import { type JobListing, JobListingStatus } from '@prisma/client';
import {
  CheckCircle,
  ChevronUp,
  Replace,
  StarIcon,
  StarOff,
  TrashIcon,
} from 'lucide-react';
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

interface BulkJobListingActionBarProps {
  addToLeads?: (ids: string[]) => Promise<void>;
  dismiss?: (ids: string[]) => Promise<void>;
  resetSelectedJobs?: () => void;
  save?: (ids: string[]) => Promise<void>;
  selectedJobs: Record<string, JobListing>;
  undismiss?: (ids: string[]) => Promise<void>;
  unsave?: (ids: string[]) => Promise<void>;
}

export const BulkJobListingActionBar = ({
  addToLeads,
  save,
  dismiss,
  undismiss,
  selectedJobs = {},
  resetSelectedJobs,
  unsave,
}: BulkJobListingActionBarProps) => {
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isDismissPending, startDismissTransition] = useTransition();
  const [isUndismissPending, startUndismissTransition] = useTransition();
  const [isAddToLeadsPending, startAddToLeadsTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();
  const [isUnsavePending, startUnsaveTransition] = useTransition();
  const router = useRouter();

  const hasRowSelections = Object.keys(selectedJobs).length > 0;

  const handleDismiss = async () => {
    if (dismiss) {
      startDismissTransition(async () => {
        await dismiss(Object.keys(selectedJobs));

        setTimeout(() => {
          router.refresh();
        }, 1500);

        resetSelectedJobs?.();
      });
    }
  };

  const handleUndismiss = async () => {
    if (undismiss) {
      startUndismissTransition(async () => {
        await undismiss(Object.keys(selectedJobs));

        setTimeout(() => {
          router.refresh();
        }, 1500);

        resetSelectedJobs?.();
      });
    }
  };

  const handleAddToLeads = async () => {
    if (addToLeads) {
      startAddToLeadsTransition(async () => {
        await addToLeads(Object.keys(selectedJobs));

        setTimeout(() => {
          router.refresh();
        }, 1500);

        resetSelectedJobs?.();
      });
    }
  };

  const handleSave = async () => {
    if (save) {
      startSaveTransition(async () => {
        await save(Object.keys(selectedJobs));

        setTimeout(() => {
          router.refresh();
        }, 1500);

        resetSelectedJobs?.();
      });
    }
  };

  const handleUnsave = async () => {
    if (unsave) {
      startUnsaveTransition(async () => {
        await unsave(Object.keys(selectedJobs));

        setTimeout(() => {
          router.refresh();
        }, 1500);

        resetSelectedJobs?.();
      });
    }
  };

  const canAddToLeads =
    addToLeads &&
    Object.values(selectedJobs).some(
      job => job.status === JobListingStatus.UNREVIEWED,
    );
  const canDismiss =
    dismiss &&
    Object.values(selectedJobs).some(
      job => job.status === JobListingStatus.UNREVIEWED,
    );
  const canUndismiss =
    undismiss &&
    Object.values(selectedJobs).some(
      job => job.status === JobListingStatus.DISMISSED,
    );
  const canSave = save && Object.values(selectedJobs).some(job => !job.saved);
  const canUnsave =
    unsave && Object.values(selectedJobs).some(job => job.saved);

  const getAddToLeadsCount = () =>
    Object.values(selectedJobs).filter(
      job => job.status === JobListingStatus.UNREVIEWED,
    ).length;

  const getDismissCount = () =>
    Object.values(selectedJobs).filter(
      job => job.status === JobListingStatus.UNREVIEWED,
    ).length;

  const getUndismissCount = () =>
    Object.values(selectedJobs).filter(
      job => job.status === JobListingStatus.DISMISSED,
    ).length;

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
            'mx-auto flex rounded-md border border-border/50 bg-accent/10 p-1 shadow-md shadow-foreground/20 drop-shadow-xl backdrop-blur-lg transition-all data-[state=closed]:duration-500 data-[state=open]:duration-300',
            'data-[state=closed]:translate-y-[200%] data-[state=closed]:scale-0 data-[state=closed]:opacity-0',
            'data-[state=open]:translate-y-[-20%] data-[state=open]:scale-100 data-[state=open]:opacity-100',
            'md:min-w-[310px]',
          )}
          data-state={hasRowSelections ? 'open' : 'closed'}
        >
          <div className="flex grow rounded-sm border border-border bg-background/80 py-2 shadow-sm shadow-foreground/5 drop-shadow-sm backdrop-blur-lg">
            <div className="flex grow items-center border-r border-border px-4">
              <span className="text-sm md:text-xs">
                <span className="font-semibold text-foreground">
                  {Object.keys(selectedJobs).length}{' '}
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
                  {canAddToLeads && (
                    <DropdownMenuItem
                      className="cursor-pointer text-sm font-semibold text-green-500 hover:!bg-green-500/90 hover:!text-white"
                      onClick={handleAddToLeads}
                    >
                      <CheckCircle className="!size-3.5" />
                      <span>Add to leads ({getAddToLeadsCount()})</span>
                    </DropdownMenuItem>
                  )}

                  {canDismiss && (
                    <DropdownMenuItem
                      className="cursor-pointer text-sm font-semibold text-red-500 hover:!bg-red-500/90 hover:!text-white"
                      onClick={handleDismiss}
                    >
                      <TrashIcon className="!size-3.5" />
                      <span>Dismiss ({getDismissCount()})</span>
                    </DropdownMenuItem>
                  )}

                  {canUndismiss && (
                    <DropdownMenuItem
                      className="cursor-pointer text-sm font-semibold text-green-500 hover:!bg-green-500/90 hover:!text-white"
                      onClick={handleUndismiss}
                    >
                      <CheckCircle className="!size-3.5" />
                      <span>Undismiss ({getUndismissCount()})</span>
                    </DropdownMenuItem>
                  )}

                  {canSave && (
                    <DropdownMenuItem
                      className="cursor-pointer text-sm font-semibold text-yellow-500 hover:!bg-yellow-500/90 hover:!text-white"
                      onClick={handleSave}
                    >
                      <StarIcon className="!size-3.5" />
                      <span>
                        Save (
                        {
                          Object.values(selectedJobs).filter(job => !job.saved)
                            .length
                        }
                        )
                      </span>
                    </DropdownMenuItem>
                  )}

                  {canUnsave && (
                    <DropdownMenuItem
                      className="cursor-pointer text-sm font-semibold text-muted-foreground hover:!bg-muted"
                      onClick={handleUnsave}
                    >
                      <StarOff className="!size-3.5" />
                      <span>
                        Unsave (
                        {
                          Object.values(selectedJobs).filter(job => job.saved)
                            .length
                        }
                        )
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden flex-col space-y-1.5 border-l border-l-border/30 md:flex md:flex-row md:space-y-0">
              <div className="space-x-1.5 px-2 pb-2 md:px-2 md:pb-0">
                {canAddToLeads && (
                  <Button
                    className="space-x-0 text-green-500 shadow-sm shadow-green-300/0 drop-shadow-sm transition-all duration-300 hover:border-green-500/30 hover:bg-green-500 hover:text-green-50 hover:shadow-lg hover:shadow-green-300/60"
                    onClick={handleAddToLeads}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <CheckCircle className="!size-3.5" />
                    <span className="text-xs font-semibold">
                      Add to Leads ({getAddToLeadsCount()})
                    </span>
                  </Button>
                )}

                {canDismiss && (
                  <Button
                    className="space-x-0 text-red-500 shadow-sm shadow-red-300/0 drop-shadow-sm transition-all duration-300 hover:border-red-500/30 hover:bg-red-500 hover:text-red-50 hover:shadow-lg hover:shadow-red-300/60"
                    onClick={handleDismiss}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <TrashIcon className="!size-3.5" />
                    <span className="text-xs font-semibold">
                      Dismiss ({getDismissCount()})
                    </span>
                  </Button>
                )}

                {canSave && (
                  <Button
                    className="space-x-0 text-yellow-500 shadow-sm shadow-yellow-300/0 drop-shadow-sm transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-500 hover:text-yellow-50 hover:shadow-lg hover:shadow-yellow-300/60"
                    onClick={handleSave}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <StarIcon className="!size-4" />
                    <span className="text-xs font-semibold">
                      Save (
                      {
                        Object.values(selectedJobs).filter(job => !job.saved)
                          .length
                      }
                      )
                    </span>
                  </Button>
                )}

                {canUnsave && (
                  <Button
                    className="space-x-0 text-muted-foreground shadow-sm shadow-yellow-300/0 drop-shadow-sm transition-all duration-300 hover:border-muted-foreground/30 hover:bg-muted hover:text-muted-foreground hover:shadow-lg hover:shadow-muted/60"
                    onClick={handleUnsave}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <StarIcon className="!size-4" />
                    <span className="text-xs font-semibold">
                      Unsave (
                      {
                        Object.values(selectedJobs).filter(job => job.saved)
                          .length
                      }
                      )
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal.Root>
  );
};

BulkJobListingActionBar.displayName = 'BulkJobListingActionBar';
