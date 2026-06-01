'use client';

import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const CommandMenu = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <button
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background p-2 text-sm text-muted-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <SearchIcon className="size-3.5" />
        <span className="mr-5 text-xs">Search everything...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog
        description="Search everything..."
        onOpenChange={setOpen}
        open={open}
      >
        <VisuallyHidden asChild>
          <DialogTitle>Search everything...</DialogTitle>
        </VisuallyHidden>

        <VisuallyHidden asChild>
          <DialogDescription>Search jobs, leads, and more.</DialogDescription>
        </VisuallyHidden>
        <CommandInput
          className="[&>svg]:!size-3"
          placeholder="Type a command or search..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Job Listings</CommandItem>
            <CommandItem>Job Leads</CommandItem>
            <CommandItem>Job Scraper</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
CommandMenu.displayName = 'CommandMenu';
export { CommandMenu };
