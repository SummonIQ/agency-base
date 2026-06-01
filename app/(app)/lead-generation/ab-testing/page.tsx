import { Metadata } from 'next';
import ABTestingClient from './client';

export const metadata: Metadata = {
  title: 'A/B Testing | Lead Generation | AgencyBase',
  description: 'Create and manage A/B tests for email templates to optimize performance.',
};

export default function ABTestingPage() {
  return <ABTestingClient />;
}