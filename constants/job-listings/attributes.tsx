import { JobListingStatus } from '@prisma/client';
import { Ban, EyeOff } from 'lucide-react';
import { TbTargetArrow } from 'react-icons/tb';

export const JobListingStatusAttributes = {
  variants: {
    default: {
      [JobListingStatus.UNREVIEWED]: {
        className: 'bg-gray-400/10 text-gray-400 py-1 px-2',
        icon: <EyeOff className="size-3.5" />,
        label: 'Unreviewed',
      },
      [JobListingStatus.DISMISSED]: {
        className: 'bg-gray-400/10 text-gray-400 py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Dismissed',
      },
      [JobListingStatus.ADDED_TO_LEADS]: {
        className: 'text-green-400 bg-green-400/10 py-1 px-2',
        icon: <TbTargetArrow className="size-3.5" />,
        label: 'Added to Leads',
      },
    },
    ghost: {
      [JobListingStatus.UNREVIEWED]: {
        className:
          'bg-transparent text-gray-400 border border-transparent py-1 px-2',
        icon: <EyeOff className="size-3.5" />,
        label: 'Unreviewed',
      },
      [JobListingStatus.DISMISSED]: {
        className:
          'bg-transparent text-gray-400 border border-transparent py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Dismissed',
      },
      [JobListingStatus.ADDED_TO_LEADS]: {
        className:
          'bg-transparent text-green-400 border border-transparent py-1 px-2',
        icon: <TbTargetArrow className="size-3.5" />,
        label: 'Added to Leads',
      },
    },
    outline: {
      [JobListingStatus.UNREVIEWED]: {
        className:
          'bg-transparent border border-gray-400/20 text-gray-400 py-1 px-2',
        icon: <EyeOff className="size-3.5" />,
        label: 'Unreviewed',
      },
      [JobListingStatus.DISMISSED]: {
        className:
          'bg-transparent border border-gray-400/20 text-gray-400 py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Dismissed',
      },
      [JobListingStatus.ADDED_TO_LEADS]: {
        className:
          'bg-transparent border border-green-400/20 text-green-400 py-1 px-2',
        icon: <TbTargetArrow className="size-3.5" />,
        label: 'Added to Leads',
      },
    },
  },
};
