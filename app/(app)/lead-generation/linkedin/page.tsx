import { Metadata } from 'next';
import LinkedInClient from './client';

export const metadata: Metadata = {
  title: 'LinkedIn Automation | Lead Generation | AgencyBase',
  description: 'Automate LinkedIn outreach and connection building for lead generation.',
};

export default function LinkedInPage() {
  return <LinkedInClient />;
}