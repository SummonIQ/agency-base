'use client';

import Markdown from 'react-markdown';

import { cn } from '@/lib/css';

export function MarkdownPreview({
  className,
  markdown,
}: {
  className?: string;
  markdown: string;
}) {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className={cn(
      'prose relative h-full max-w-none grow text-sm text-foreground',
      className,
    )}>
      <Markdown>
        {markdown}
      </Markdown>
    </div>
  );
}
