import { ResumeOptimizationStatus } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { ResumeOptimizationStatusAttributes } from '@/constants/resumes/optimization';
import { cn } from '@/lib/css';

const ResumeOptimizationStatusBadge = ({
  className,
  status,
  variant = 'default',
}: {
  className?: string;
  status: ResumeOptimizationStatus;
  variant?: 'default' | 'outline' | 'ghost';
}) => {
  const { variants } = ResumeOptimizationStatusAttributes;
  const { className: badgeClassName, icon, label } = variants[variant][status];

  return (
    <Badge className={cn(badgeClassName, className)} variant={variant}>
      {icon}

      <span>{label}</span>
    </Badge>
  );
};

export { ResumeOptimizationStatusBadge };
