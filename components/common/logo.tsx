'use client';

import { cn } from '@/lib/css';
import { Briefcase } from 'lucide-react';


export function Logo({
  className,

}: {
  className?: string;

}) {
  return (
    <div className={cn('relative z-10 flex flex-row space-x-2.5 items-center justify-center', className)}>
      <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xl shadow-primary/30 drop-shadow-lg">
        <Briefcase className="relative z-10 size-4 drop-shadow-lg " />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">AgencyBase</span>
        <span className="truncate text-xs">Beta</span>
      </div>
    </div>
  );
}
