'use client';

import { type HTMLAttributes, useState } from 'react';

import { cn } from '@/lib/css';

import { Button } from './button';

interface ReadMoreBlockProps extends HTMLAttributes<HTMLDivElement> {
  defaultExpanded?: boolean;
  expandFullHeight?: boolean;
}

const ReadMoreBlock = ({
  children,
  expandFullHeight = true,
  className,
  defaultExpanded = false,
}: ReadMoreBlockProps) => {
  // Initialize state from localStorage (if available) or use defaultExpanded
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        expanded
          ? expandFullHeight
            ? ''
            : 'overflow-y-auto pb-16'
          : 'min-h-24 max-h-72',
      )}
    >
      <div className={cn(!expanded ? '' : '', className)}>{children}</div>

      {!expanded ? (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-md bg-gradient-to-t from-background from-0% to-transparent to-80%" />
      ) : null}

      <div
        className={cn(
          'absolute left-1/2 z-20 mx-auto flex -translate-x-1/2 items-center justify-center',
          !expanded ? 'bottom-4' : 'bottom-7',
        )}
      >
        <Button
          className="h-6 rounded-full !bg-foreground/80 px-3 text-xs font-medium !text-background drop-shadow-md transition-colors duration-300 hover:bg-foreground hover:text-background"
          onClick={() => setExpanded(!expanded)}
          size="sm"
        >
          {expanded ? 'Read less' : 'Read more'}
        </Button>
      </div>
    </div>
  );
};

ReadMoreBlock.displayName = 'ReadMoreBlock';

export { ReadMoreBlock };
