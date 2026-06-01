import { Metadata } from 'next';
import AnalyticsClient from './client';

export const metadata: Metadata = {
  title: 'Lead Generation Analytics | AgencyBase',
  description: 'Track your lead generation and outreach performance with comprehensive analytics and insights.',
};

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}