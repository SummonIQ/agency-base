import { JobLeadStatus } from '@prisma/client';
import {
  Ban,
  CalendarCheck2,
  CalendarClock,
  CheckCircle,
  Handshake,
  ThumbsDown,
} from 'lucide-react';
import { PiSignatureBold } from 'react-icons/pi';
import { TbTargetArrow } from 'react-icons/tb';

export const JobLeadStatusAttributes = {
  variants: {
    default: {
      [JobLeadStatus.ADDED]: {
        className: 'bg-gray-400/10 text-gray-400 py-1 px-2',
        icon: <TbTargetArrow className="size-3.5" />,
        label: 'Added',
      },
      [JobLeadStatus.DISMISSED]: {
        className: 'bg-gray-400/10 text-gray-400 py-1 px-2',
        icon: <Ban className="size-3.5" />, // Ban icon
        label: 'Dismissed',
      },
      [JobLeadStatus.APPLIED]: {
        className: 'text-yellow-400 bg-yellow-400/10 py-1 px-2',
        icon: <CheckCircle className="size-3.5" />,
        label: 'Applied',
      },
      [JobLeadStatus.INTERVIEW_SCHEDULED]: {
        className: 'bg-orange-400/10 text-orange-400 py-1 px-2', //    className: 'bg-blue-400/10 text-blue-400/60',
        icon: <CalendarClock className="size-3.5" />,
        label: 'Interview Scheduled',
      },
      [JobLeadStatus.INTERVIEWED]: {
        className: 'bg-blue-400/10 text-blue-400 py-1 px-2', //    className: 'bg-blue-400/10 text-blue-400/60',
        icon: <CalendarCheck2 className="size-3.5" />,
        label: 'Interviewed',
      },
      [JobLeadStatus.OFFER_MADE]: {
        className: 'bg-purple-400/10 text-purple-400 py-1 px-2',
        icon: <PiSignatureBold className="size-3.5" />,
        label: 'Offer Made',
      },
      [JobLeadStatus.OFFER_ACCEPTED]: {
        className: 'bg-green-400/10 text-green-400 py-1 px-2',
        icon: <Handshake className="size-3.5" />,
        label: 'Offer Accepted',
      },
      [JobLeadStatus.REJECTED]: {
        className: 'bg-red-400/10 text-red-400 py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Rejected',
      },
      [JobLeadStatus.OFFER_REJECTED]: {
        className: 'bg-red-400/10 text-red-400 py-1 px-2',
        icon: <ThumbsDown className="size-3.5" />,
        label: 'Offer Rejected',
      },
    },
    ghost: {
      [JobLeadStatus.ADDED]: {
        className:
          'bg-transparent text-gray-400 border border-transparent py-1 px-2',
        icon: <TbTargetArrow className="size-3.5" />,
        label: 'Added',
      },
      [JobLeadStatus.DISMISSED]: {
        className:
          'bg-transparent text-gray-400 border border-transparent py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Dismissed',
      },
      [JobLeadStatus.APPLIED]: {
        className:
          'bg-transparent text-yellow-400 border border-transparent py-1 px-2',
        icon: <CheckCircle className="size-3.5" />,
        label: 'Applied',
      },

      [JobLeadStatus.INTERVIEW_SCHEDULED]: {
        className:
          'bg-transparent text-orange-400 border border-transparent py-1 px-2',
        icon: <CalendarClock className="size-3.5" />,
        label: 'Interview Scheduled',
      },
      [JobLeadStatus.INTERVIEWED]: {
        className:
          'bg-transparent text-blue-400 border border-transparent py-1 px-2',
        icon: <CalendarCheck2 className="size-3.5" />,
        label: 'Interviewed',
      },

      [JobLeadStatus.OFFER_MADE]: {
        className:
          'bg-transparent text-purple-400 border border-transparent py-1 px-2',
        icon: <PiSignatureBold className="size-3.5" />,
        label: 'Offer Made',
      },
      [JobLeadStatus.OFFER_ACCEPTED]: {
        className:
          'bg-transparent text-green-400 border border-transparent py-1 px-2',
        icon: <Handshake className="size-3.5" />,
        label: 'Offer Accepted',
      },
      [JobLeadStatus.REJECTED]: {
        className:
          'bg-transparent text-red-400 border border-transparent py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Rejected',
      },
      [JobLeadStatus.OFFER_REJECTED]: {
        className:
          'bg-transparent text-red-400 border border-transparent py-1 px-2',
        icon: <ThumbsDown className="size-3.5" />,
        label: 'Offer Rejected',
      },
    },
    outline: {
      [JobLeadStatus.ADDED]: {
        className:
          'bg-transparent border border-gray-400/20 text-gray-400 py-1 px-2',
        icon: <TbTargetArrow className="size-3.5" />,
        label: 'Added',
      },
      [JobLeadStatus.DISMISSED]: {
        className:
          'bg-transparent border border-gray-400/20 text-gray-400 py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Dismissed',
      },
      [JobLeadStatus.APPLIED]: {
        // ArchiveRestore icon
        className:
          'bg-transparent border border-yellow-400/20 text-yellow-400 py-1 px-2',
        icon: <CheckCircle className="size-3.5" />,
        label: 'Applied',
      },
      [JobLeadStatus.INTERVIEW_SCHEDULED]: {
        className:
          'bg-transparent border border-orange-400/20 text-orange-400 py-1 px-2',
        icon: <CalendarClock className="size-3.5" />,
        label: 'Interview Scheduled',
      },
      [JobLeadStatus.INTERVIEWED]: {
        className:
          'bg-transparent border border-blue-400/20 text-blue-400 py-1 px-2',
        icon: <CalendarCheck2 className="size-3.5" />,
        label: 'Interviewed',
      },
      [JobLeadStatus.OFFER_MADE]: {
        className:
          'bg-transparent border border-purple-400/20 text-purple-400 py-1 px-2',
        icon: <PiSignatureBold className="size-3.5" />,
        label: 'Offer Made',
      },
      [JobLeadStatus.OFFER_ACCEPTED]: {
        className:
          'bg-transparent border border-green-400/20 text-green-400 py-1 px-2',
        icon: <Handshake className="size-3.5" />,
        label: 'Offer Accepted',
      },
      [JobLeadStatus.REJECTED]: {
        className: 'border-red-400/20 text-red-400 py-1 px-2',
        icon: <Ban className="size-3.5" />,
        label: 'Rejected',
      },
      [JobLeadStatus.OFFER_REJECTED]: {
        className:
          'bg-transparent border border-red-400/20 text-red-400 py-1 px-2',
        icon: <ThumbsDown className="size-3.5" />,
        label: 'Offer Rejected',
      },
    },
  },
};
