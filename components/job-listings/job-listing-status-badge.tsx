'use client';

import type { JobListingStatus } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { JobListingStatusAttributes } from '@/constants/job-listings/attributes';
import { cn } from '@/lib/css';

const JobListingStatusBadge = ({
  className,
  status,
  variant = 'default',
}: {
  className?: string;
  status: JobListingStatus;
  variant?: 'default' | 'outline' | 'ghost';
}) => {
  const { variants } = JobListingStatusAttributes;
  const { className: badgeClassName, icon, label } = variants[variant][status];

  return (
    <Badge className={cn(badgeClassName, className)} variant={variant}>
      {icon}

      <span>{label}</span>
    </Badge>
  );
};

export { JobListingStatusBadge };
