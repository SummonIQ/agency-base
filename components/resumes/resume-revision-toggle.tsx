'use client';

import { useState } from 'react';
import Markdown from 'react-markdown';

import { cn } from '@/lib/css';

export type ResumeRevisionToggleProps = {
  optimizedMarkdown?: string | null;
  originalMarkdown?: string | null;
};

export const ResumeRevisionToggle = ({
  originalMarkdown,
  optimizedMarkdown,
}: ResumeRevisionToggleProps) => {
  const [isOriginal, setIsOriginal] = useState(true);
  return (
    <div className="flex grow flex-col items-center">
      {/* </div> */}

      <Markdown className="prose max-w-none rounded-sm bg-background p-4 text-sm text-foreground shadow-lg md:p-5 lg:max-w-2xl">
        {isOriginal ? originalMarkdown : optimizedMarkdown}
      </Markdown>

      <div className="fixed bottom-6 mb-1 inline-flex items-center justify-center rounded-md bg-foreground/10 p-1 text-muted-foreground shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-center rounded-md bg-muted p-1 backdrop-blur-sm">
          <button
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
              isOriginal
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground',
            )}
            onClick={() => setIsOriginal(true)}
            type="button"
          >
            Original
          </button>
          <button
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
              isOriginal
                ? 'text-muted-foreground'
                : 'bg-background text-foreground shadow-sm',
            )}
            onClick={() => setIsOriginal(false)}
            type="button"
          >
            Optimized
          </button>
        </div>
      </div>
    </div>
  );
};
