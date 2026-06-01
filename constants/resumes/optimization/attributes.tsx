import { BoltIcon as SolidBoltIcon } from '@heroicons/react/24/solid';
import { ResumeOptimizationStatus } from '@prisma/client';
import { Clock4, RefreshCcw, TriangleAlert } from 'lucide-react';

export const ResumeOptimizationStatusAttributes = {
  variants: {
    default: {
      [ResumeOptimizationStatus.QUEUED]: {
        className: 'bg-gray-400/10 text-gray-400 py-1 px-2',
        icon: <Clock4 className="size-3.5" />,
        label: 'Queued',
      },
      [ResumeOptimizationStatus.PROCESSING]: {
        className: 'bg-yellow-400/10 text-yellow-400 py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Processing',
      },
      [ResumeOptimizationStatus.REFINING]: {
        className: 'bg-orange-400/10 text-orange-400 py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Refining',
      },
      [ResumeOptimizationStatus.ANALYZING]: {
        className: 'bg-blue-400/10 text-blue-400 py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Analyzing',
      },
      [ResumeOptimizationStatus.OPTIMIZING]: {
        className: 'bg-purple-400/10 text-purple-400 py-1 px-2',
        icon: <SolidBoltIcon className="size-3.5 animate-pulse" />,
        label: 'Optimizing',
      },
      [ResumeOptimizationStatus.COMPLETED]: {
        className: 'bg-green-400/10 text-green-400 py-1 px-2',
        icon: <SolidBoltIcon className="size-3.5" />,
        label: 'Optimized',
      },
      [ResumeOptimizationStatus.FAILED]: {
        className: 'bg-red-400/10 text-red-400 py-1 px-2',
        icon: <TriangleAlert className="size-3.5" />,
        label: 'Failed',
      },
    },
    ghost: {
      [ResumeOptimizationStatus.QUEUED]: {
        className:
          'bg-transparent text-gray-400 border border-transparent py-1 px-2',
        icon: <Clock4 className="size-3.5" />,
        label: 'Queued',
      },
      [ResumeOptimizationStatus.PROCESSING]: {
        className:
          'bg-transparent text-yellow-400 border border-transparent py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Processing',
      },
      [ResumeOptimizationStatus.REFINING]: {
        className:
          'bg-transparent text-orange-400 border border-transparent py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Refining',
      },
      [ResumeOptimizationStatus.ANALYZING]: {
        className:
          'bg-transparent text-blue-400 border border-transparent py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Analyzing',
      },
      [ResumeOptimizationStatus.OPTIMIZING]: {
        className:
          'bg-transparent text-purple-400 border border-transparent py-1 px-2',
        icon: <SolidBoltIcon className="size-3.5 animate-pulse" />,
        label: 'Optimizing',
      },
      [ResumeOptimizationStatus.COMPLETED]: {
        className:
          'bg-transparent text-green-400 border border-transparent py-1 px-2',
        icon: <SolidBoltIcon className="size-3.5" />,
        label: 'Optimized',
      },
      [ResumeOptimizationStatus.FAILED]: {
        className:
          'bg-transparent text-red-400 border border-transparent py-1 px-2',
        icon: <TriangleAlert className="size-3.5" />,
        label: 'Failed',
      },
    },
    outline: {
      [ResumeOptimizationStatus.QUEUED]: {
        className:
          'bg-transparent border border-gray-400/20 text-gray-400 py-1 px-2',
        icon: <Clock4 className="size-3.5" />,
        label: 'Queued',
      },
      [ResumeOptimizationStatus.PROCESSING]: {
        className:
          'bg-transparent border border-yellow-400/20 text-yellow-400 py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Processing',
      },
      [ResumeOptimizationStatus.REFINING]: {
        className:
          'bg-transparent border border-orange-400/20 text-orange-400 py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Refining',
      },

      [ResumeOptimizationStatus.ANALYZING]: {
        className:
          'bg-transparent border border-blue-400/20 text-blue-400 py-1 px-2',
        icon: <RefreshCcw className="size-3.5 animate-spin" />,
        label: 'Analyzing',
      },
      [ResumeOptimizationStatus.OPTIMIZING]: {
        className:
          'bg-transparent border border-purple-400/20 text-purple-400 py-1 px-2',
        icon: <SolidBoltIcon className="size-3.5 animate-pulse" />,
        label: 'Optimizing',
      },
      [ResumeOptimizationStatus.COMPLETED]: {
        className:
          'bg-transparent border border-green-400/20 text-green-400 py-1 px-2', // BecipsFlexed icon
        icon: <SolidBoltIcon className="size-3.5" />,
        label: 'Optimized',
      },
      [ResumeOptimizationStatus.FAILED]: {
        className:
          'bg-transparent border border-red-400/20 text-red-400 py-1 px-2',
        icon: <TriangleAlert className="size-3.5" />,
        label: 'Failed',
      },
    },
  },
};
