import { FileChartColumn, FileScan, Bot, Settings, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Separator } from '@/components/ui/separator';

const GridCard = ({
  title,
  description,
  href,
  icon,
}: {
  description: string;
  href?: string;
  icon: React.ReactNode;
  title: string;
}) => {
  const card = (
    <div className="flex min-h-24 cursor-pointer flex-row rounded-md border border-border/50 bg-background shadow-sm shadow-border/10 ring-offset-2 ring-offset-background drop-shadow-sm transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:shadow-primary/20 hover:ring-2 hover:ring-primary">
      <div className="flex items-start justify-center p-4 pr-0">{icon}</div>
      <div className="flex flex-col space-y-1 p-4 px-5">
        <h5 className="font-semibold text-foreground/75">{title}</h5>
        <p className="text-pretty text-sm text-muted-foreground/70">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
};

export const metadata: Metadata = {
  description: 'A collection of tools to help you with your job search.',
  title: 'Tools | gimmejob',
};

export default function ToolsPage() {
  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Tools</PageTitle>
          <PageDescription>
            A collection of tools to help you with your job search.
          </PageDescription>
        </PageSummary>
      </PageHeader>
      <PageContent>
        <Separator
          className="mb-4 bg-border/60 md:mb-6"
          orientation="horizontal"
        />

        <div className="mb-4 flex flex-col">
          <h4 className="text-lg font-semibold text-foreground/80">
            Resume Optimization
          </h4>
          <p className="text-sm text-muted-foreground/70">
            Tools to help you optimize your resume for Applicant Tracking
            Systems and job descriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-4/5 xl:w-full xl:grid-cols-3">
          <GridCard
            description="Optimize your resume for Applicant Tracking Systems."
            href="/tools/ats-optimizer"
            icon={
              <div className="flex items-center justify-center rounded-md bg-orange-500/10 p-3">
                <FileScan className="size-6 text-orange-500" />
              </div>
            }
            title="ATS Optimizer"
          />
          <GridCard
            description="Optimize your resume against a job description."
            href="/tools/job-details-optimizer"
            icon={
              <div className="flex items-center justify-center rounded-md bg-green-500/10 p-3">
                <FileChartColumn className="size-6 text-green-500" />
              </div>
            }
            title="Job Details Optimizer"
          />
        </div>

        <div className="mb-4 mt-8 flex flex-col">
          <h4 className="text-lg font-semibold text-foreground/80">
            Application Automation
          </h4>
          <p className="text-sm text-muted-foreground/70">
            Automate your job application process with intelligent workflows and safety controls.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-4/5 xl:w-full xl:grid-cols-3">
          <GridCard
            description="Set up automated job application workflows with smart filtering and approval controls."
            href="/tools/automation"
            icon={
              <div className="flex items-center justify-center rounded-md bg-blue-500/10 p-3">
                <Bot className="size-6 text-blue-500" />
              </div>
            }
            title="Application Automation"
          />
          <GridCard
            description="Configure automation settings, safety controls, and application preferences."
            href="/tools/automation/settings"
            icon={
              <div className="flex items-center justify-center rounded-md bg-purple-500/10 p-3">
                <Settings className="size-6 text-purple-500" />
              </div>
            }
            title="Automation Settings"
          />
          <GridCard
            description="Comprehensive safety controls, approval workflows, and audit logging for automation."
            href="/tools/automation/safety"
            icon={
              <div className="flex items-center justify-center rounded-md bg-red-500/10 p-3">
                <Shield className="size-6 text-red-500" />
              </div>
            }
            title="Safety Controls"
          />
        </div>
      </PageContent>
    </Page>
  );
}
