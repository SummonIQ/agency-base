'use client';

import { JobSearchStatus } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { JobSearchStatusAttributes } from '@/constants/job-searches/attributes';
import { cn } from '@/lib/css';

const JobSearchStatusBadge = ({
  className,
  status,
  variant = 'default',
}: {
  className?: string;
  status: JobSearchStatus;
  variant?: 'default' | 'outline' | 'ghost';
}) => {
  console.log('status', status);
  if (!status) return null;

  const attributes = JobSearchStatusAttributes?.variants?.[variant]?.[status];
  const { className: badgeClassName, icon, label } = attributes;

  return (
    <Badge className={cn(badgeClassName, className)} variant={variant}>
      {icon}

      <span>{label}</span>
    </Badge>
  );
};

export { JobSearchStatusBadge };
