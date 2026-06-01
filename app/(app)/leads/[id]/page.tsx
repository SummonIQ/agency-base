import {
  JobBoard,
  JobFitAnalysis,
  JobFitAnalysisStatus,
  JobLead,
  JobLeadOptimizationStatus,
  JobLeadStatus,
  JobListing,
  ResumeOptimization,
  ResumeOptimizationStatus,
  ResumeRevision,
} from '@prisma/client';
import { CalendarIcon } from '@radix-ui/react-icons';
import { RefreshCcw } from 'lucide-react';
import type { Metadata as NextMetadata } from 'next';
import Link from 'next/link';
import { notFound, redirect, unauthorized } from 'next/navigation';
import { TbCancel } from 'react-icons/tb';
import Markdown from 'react-markdown';
import { DownloadResume } from '@/components/resumes/download-resume';
import { DateLabel } from '@/components/data/date-label';
import {
  Metadata,
  MetadataIcon,
  MetadataLabel,
} from '@/components/data/metadata-list';
import { JobLeadProgressTracker } from '@/components/job-leads/job-lead-progress-tracker';
import {
  Page,
  PageActions,
  PageContent,
  PageHeader,
  PageMetadata,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { ResumeOptimizationStatusBadge } from '@/components/resumes/resume-optimization-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ReadMoreBlock } from '@/components/ui/read-more-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/css';
import { getJobLead } from '@/lib/job-leads/query';
import { getSessionUser } from '@/lib/user';
import { JobLeadStatusMenu } from '@/components/job-leads/job-lead-status-menu';
import { updateJobLeadStatus } from '@/lib/job-leads/status';
import { SetJobLeadAppliedButton } from '@/components/job-leads/set-job-lead-applied-button';
import { JobLeadProgress } from '@/components/job-leads/job-lead-progress';
import { MarkdownPreview } from '@/components/data/markdown-preview';
import { Suspense } from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<NextMetadata> {
  // read route params
  const id = (await params).id;
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorized();
  }

  const jobLead = (await getJobLead({
    id,
    include: {
      jobListing: true,
    },
    userId: user.id,
  })) as JobLead & {
    jobListing: JobListing;
  };

  if (!jobLead) {
    return {
      description: 'View job lead details',
      title: 'Job Lead Details | gimmejob',
    };
  }

  return {
    description: jobLead?.jobListing?.description?.slice(0, 32),
    title: `Job Lead - ${jobLead.jobListing?.title} | gimmejob`,
  };
}

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();

  if (!user?.id) {
    return unauthorized();
  }

  const { id } = await params;

  // Note: The include now fetches jobFitAnalysis along with other relations.
  const jobLead = (await getJobLead({
    id,
    include: {
      jobFitAnalysis: true,
      jobListing: true,
      optimization: {
        include: {
          resumeRevision: true,
        },
      },
    },
    userId: user.id,
  })) as JobLead & {
    jobFitAnalysis: JobFitAnalysis;
    jobListing: JobListing;
    optimization: ResumeOptimization & { resumeRevision: ResumeRevision };
  };

  if (!jobLead) {
    return notFound();
  }

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>{jobLead?.jobListing?.title}</PageTitle>
          <PageMetadata>
            <Metadata>
              <MetadataIcon>
                <CalendarIcon
                  aria-hidden="true"
                  className="size-5 shrink-0 opacity-80"
                />
              </MetadataIcon>
              <MetadataLabel>
                <span>
                  Created on{' '}
                  <DateLabel
                    className="font-semibold"
                    date={jobLead?.createdAt}
                  />
                </span>
              </MetadataLabel>
            </Metadata>
          </PageMetadata>
        </PageSummary>
        <PageActions>
          {jobLead.status !== JobLeadStatus.APPLIED && (
            <Suspense fallback={<></>}>
              <SetJobLeadAppliedButton
                action={async () => {
                  'use server';

                  const result = await updateJobLeadStatus({
                    jobLeadId: jobLead.id,
                    status: JobLeadStatus.APPLIED,
                  });

                  return result;
                }}
                jobLeadId={jobLead.id}
              />
            </Suspense>
          )}
          <Button
            className={cn(
              'space-x-0 border-input/75 text-muted-foreground shadow-sm ring ring-transparent ring-offset-0 drop-shadow-sm transition-all duration-300 hover:shadow-lg dark:border-input/85 dark:hover:shadow-background',
              false
                ? 'pointer-events-none cursor-default'
                : 'hover:border-primary/25 hover:bg-background dark:hover:border-primary/30',
            )}
            disabled={false}
            size="sm"
            type="submit"
            variant="outline"
          >
            <TbCancel className="size-4" />
            <span className="text-sm font-semibold">Dismiss</span>
          </Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <Suspense fallback={<></>}>
          {jobLead.optimization?.status === ResumeOptimizationStatus.QUEUED ||
          jobLead.optimization?.status === ResumeOptimizationStatus.ANALYZING ||
          jobLead.optimization?.status === ResumeOptimizationStatus.REFINING ||
          jobLead.optimization?.status ===
            ResumeOptimizationStatus.PROCESSING ||
          jobLead.optimization?.status ===
            ResumeOptimizationStatus.OPTIMIZING ? (
            <JobLeadProgressTracker
              createComplete={
                jobLead.jobFitAnalysis.status === JobFitAnalysisStatus.COMPLETED
              }
              analyzeComplete={
                jobLead.jobFitAnalysis.status === JobFitAnalysisStatus.COMPLETED
              }
              analyzeProgress={jobLead.jobFitAnalysis.progress}
              // optimizedComplete={
              //   jobLead.optimization.status === ResumeOptimizationStatus.COMPLETED
              // }
              optimizedProgress={jobLead.optimization.progress}
              jobLeadId={jobLead.id}
            />
          ) : (
            <JobLeadProgress status={jobLead.status} />
          )}
        </Suspense>

        <Tabs defaultValue="job-details">
          <TabsList className="mb-1">
            <TabsTrigger value="job-details">Job Details</TabsTrigger>
            <TabsTrigger className="flex items-center gap-1.5" value="analysis">
              {jobLead.jobFitAnalysis ? (
                jobLead.jobFitAnalysis.status ===
                JobFitAnalysisStatus.ANALYZING ? (
                  <>
                    <span className="size-2.5 animate-pulse rounded-full bg-blue-500">
                      <RefreshCcw className="size-1.5 animate-spin text-background" />
                    </span>
                    Job Fit Analysis
                  </>
                ) : jobLead.jobFitAnalysis.status ===
                  JobFitAnalysisStatus.COMPLETED ? (
                  <>
                    <span className="size-2.5 rounded-full bg-green-500" />
                    Job Fit Analysis
                  </>
                ) : (
                  <>
                    <span className="size-2.5 rounded-full bg-red-500" />
                    Job Fit Analysis
                  </>
                )
              ) : (
                <>
                  <span className="size-2.5 rounded-full bg-red-500" />
                  Job Fit Analysis
                </>
              )}
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-1.5" value="resumes">
              {jobLead.optimization?.status ===
                ResumeOptimizationStatus.ANALYZING ||
              jobLead.optimization?.status ===
                ResumeOptimizationStatus.QUEUED ? (
                <>
                  <span className="size-2.5 animate-pulse rounded-full bg-blue-500">
                    <RefreshCcw className="size-1.5 animate-spin text-background" />
                  </span>
                  Optimizing Resume
                </>
              ) : jobLead.optimization?.status ===
                ResumeOptimizationStatus.COMPLETED ? (
                <>
                  <span className="size-2.5 rounded-full bg-green-500" />
                  Optimized Resume
                </>
              ) : jobLead.optimization?.status ===
                ResumeOptimizationStatus.FAILED ? (
                <>
                  <span className="size-2.5 rounded-full bg-red-500" />
                  Optimized Resume
                </>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-details">
            <Card>
              <CardContent className="flex-col p-0 md:p-0">
                <dl className="grid grid-cols-1 sm:grid-cols-2">
                  {jobLead.jobListing?.description && (
                    <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Description
                      </dt>
                      <ReadMoreBlock className="text-pretty text-sm/6 tracking-wide text-foreground">
                        <dd
                          dangerouslySetInnerHTML={{
                            __html: jobLead.jobListing.description
                              .replace(/(?:\r\n|\r|\n)/g, '<br />')
                              .replace(/(?:\*|\n)/g, '<br />'),
                          }}
                        />
                      </ReadMoreBlock>
                    </div>
                  )}
                  {jobLead?.jobListing?.company && (
                    <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5 ">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Company
                      </dt>
                      <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                        {jobLead.jobListing.companyLogoUrl && (
                          <img
                            alt={jobLead.jobListing.company}
                            className="mr-3 h-12 max-h-24 rounded-sm border border-border"
                            src={jobLead.jobListing.companyLogoUrl}
                          />
                        )}
                        <span>{jobLead.jobListing.company}</span>
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.location && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Location
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.location}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.salary && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Salary
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.salary}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.remote && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Remote
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.remote ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.jobBoard && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Job board
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.jobBoard ===
                        JobBoard.CAREER_BUILDER ? (
                          <span>CareerBuilder</span>
                        ) : jobLead.jobListing.jobBoard === JobBoard.GOOGLE ? (
                          <span>Google Jobs</span>
                        ) : null}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.jobBoardUrl && (
                    <div className="border-b border-border p-4 sm:col-span-2 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        URL
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 sm:mt-2">
                        <Link
                          className="text-primary underline underline-offset-2"
                          href={jobLead.jobListing.jobBoardUrl}
                        >
                          {jobLead.jobListing.jobBoardUrl}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.healthInsurance && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Health Insurance
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.healthInsurance ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.dentalCoverage && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Dental Coverage
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.dentalCoverage ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.paidTimeOff && (
                    <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Paid Time Off
                      </dt>
                      <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                        {jobLead.jobListing.paidTimeOff ? 'Yes' : 'No'}
                      </dd>
                    </div>
                  )}
                  {jobLead.jobListing?.requirements &&
                    jobLead.jobListing.requirements.length > 0 && (
                      <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                        <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                          Requirements
                        </dt>
                        <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                          <ul className="list-disc space-y-2.5 pl-6">
                            {jobLead.jobListing.requirements.map(
                              (requirement, i) => (
                                <li
                                  className="text-pretty text-sm/5"
                                  key={`${requirement}-${i}`}
                                >
                                  {requirement}
                                </li>
                              ),
                            )}
                          </ul>
                        </dd>
                      </div>
                    )}
                  {jobLead.jobListing?.responsibilities &&
                    jobLead.jobListing.responsibilities.length > 0 && (
                      <div className="border-b border-border/60 p-4 sm:col-span-2 md:p-5">
                        <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                          Responsibilities
                        </dt>
                        <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                          <ul className="list-disc space-y-2.5 pl-6">
                            {jobLead.jobListing.responsibilities.map(
                              (responsibility, i) => (
                                <li
                                  className="text-pretty text-sm/5"
                                  key={`${responsibility}-${i}`}
                                >
                                  {responsibility}
                                </li>
                              ),
                            )}
                          </ul>
                        </dd>
                      </div>
                    )}
                  {jobLead.jobListing?.qualifications &&
                    jobLead.jobListing.qualifications.length > 0 && (
                      <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                        <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                          Qualifications
                        </dt>
                        <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                          <ul className="list-disc space-y-2.5 pl-6">
                            {jobLead.jobListing.qualifications.map(
                              (qualification, i) => (
                                <li
                                  className="text-pretty text-sm/5"
                                  key={`${qualification}-${i}`}
                                >
                                  {qualification}
                                </li>
                              ),
                            )}
                          </ul>
                        </dd>
                      </div>
                    )}
                  {jobLead.jobListing?.benefits &&
                    jobLead.jobListing.benefits.length > 0 && (
                      <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                        <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                          Benefits
                        </dt>
                        <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                          <ul className="list-disc space-y-2.5 pl-6">
                            {jobLead.jobListing.benefits.map((benefit, i) => (
                              <li
                                className="text-pretty text-sm/5"
                                key={`${benefit}-${i}`}
                              >
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  {jobLead.jobListing?.applyOptions &&
                    Array.isArray(jobLead.jobListing.applyOptions) &&
                    jobLead.jobListing.applyOptions.length > 0 && (
                      <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                        <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                          Apply Options
                        </dt>
                        <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                          <ul className="list-disc space-y-2.5 pl-6">
                            {jobLead.jobListing.applyOptions.map(
                              (applyOption, i) => (
                                <li
                                  className="text-pretty text-sm/5"
                                  key={`${(applyOption as { url: string }).url}-${i}`}
                                >
                                  <h4 className="font-semibold">
                                    {(applyOption as { title: string }).title}
                                  </h4>
                                  <Link
                                    className="block truncate text-primary underline underline-offset-2"
                                    href={
                                      (applyOption as { link: string }).link
                                    }
                                  >
                                    {(applyOption as { link: string }).link}
                                  </Link>
                                </li>
                              ),
                            )}
                          </ul>
                        </dd>
                      </div>
                    )}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardContent className="flex-col p-0 md:p-0">
                {jobLead.jobFitAnalysis ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2">
                    {jobLead.jobFitAnalysis ? (
                      <>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Job Fit Score
                          </dt>
                          <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                            <span className="font-mono text-lg">
                              {jobLead.jobFitAnalysis.overallMatchScore}
                            </span>
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Job Fit Summary
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            {jobLead.jobFitAnalysis.summary}
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Keyword Match
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            Matched Keywords:{' '}
                            {jobLead.jobFitAnalysis.keywordMatch?.matched_keywords?.join(
                              ', ',
                            )}
                            <br />
                            Match Percentage:{' '}
                            {
                              jobLead.jobFitAnalysis.keywordMatch
                                ?.match_percentage
                            }
                            %
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Missing Keywords
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            {jobLead.jobFitAnalysis.missingKeywords.join(', ')}
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Skills Alignment
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            Skills:{' '}
                            {jobLead.jobFitAnalysis.skillsAlignment?.skills?.join(
                              ', ',
                            )}
                            <br />
                            Alignment Score:{' '}
                            {
                              jobLead.jobFitAnalysis.skillsAlignment
                                ?.alignment_score
                            }
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Experience Relevance Score
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            {jobLead.jobFitAnalysis.experienceRelevanceScore}
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Education Relevance Score
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            {jobLead.jobFitAnalysis.educationRelevanceScore}
                          </dd>
                        </div>
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Recommendations
                          </dt>
                          <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                            <ul>
                              {jobLead.jobFitAnalysis.recommendations.map(
                                (rec, index) => (
                                  <li key={index}>{rec}</li>
                                ),
                              )}
                            </ul>
                          </dd>
                        </div>
                        {jobLead.jobFitAnalysis.additionalMetrics && (
                          <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                            <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                              Additional Metrics
                            </dt>
                            <dd className="text-pretty text-sm/6 tracking-wide text-foreground">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(
                                  jobLead.jobFitAnalysis.additionalMetrics,
                                  null,
                                  2,
                                )}
                              </pre>
                            </dd>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">
                          Job fit analysis not available.
                        </p>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Job fit analysis not available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumes">
            <Card>
              <CardContent className="flex-col p-0 md:p-0">
                {jobLead.optimization?.status ===
                JobLeadOptimizationStatus.COMPLETED ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5 ">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Revision
                      </dt>
                      <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                        <span>#1</span>
                      </dd>
                    </div>
                    <div className="space-y-1 border-b border-r border-border/60 p-4 sm:col-span-1 md:p-5 ">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Optimization Status
                      </dt>
                      <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                        <ResumeOptimizationStatusBadge
                          status={jobLead.optimization?.status}
                        />
                      </dd>
                    </div>
                    <div className="space-y-1 border-b border-r border-border/60 p-4 sm:col-span-1 md:p-5 ">
                      <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                        Optimization Progress
                      </dt>
                      <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                        <span>{jobLead.optimization?.progress ?? 0}%</span>
                      </dd>
                    </div>

                    {jobLead.optimization?.changelog &&
                      jobLead.optimization.changelog.length > 0 && (
                        <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            Resume Optimizations
                          </dt>
                          <dd>
                            <ul className="ml-5 list-disc">
                              {jobLead.optimization?.changelog?.map(change => (
                                <li
                                  className="text-pretty text-sm/6 tracking-wide text-foreground"
                                  key={change}
                                >
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      )}

                    {jobLead.optimization?.resumeRevision?.markdown && (
                      <Tabs
                        className="sm:col-span-2"
                        defaultValue="markdown-preview"
                      >
                        <div className="flex grow flex-col space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                          <dt className="flex grow justify-between text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                            <span>Optimized Resume</span>

                            {jobLead.optimization?.resumeRevision
                              ?.wordDocumentUrl && (
                              <DownloadResume
                                url={
                                  jobLead.optimization?.resumeRevision
                                    ?.wordDocumentUrl
                                }
                              />
                            )}
                            {/* <TabsList>
                              <TabsTrigger value="markdown-preview">
                                Preview
                              </TabsTrigger>
                              <TabsTrigger value="markdown-raw">
                                Raw
                              </TabsTrigger>
                            </TabsList> */}
                          </dt>
                          <TabsContent value="markdown-preview">
                            <ReadMoreBlock className="bg-muted/80 p-6">
                              <MarkdownPreview
                                className="rounded-sm border border-border bg-background p-10 drop-shadow-lg"
                                markdown={
                                  jobLead.optimization?.resumeRevision?.markdown
                                }
                              />
                            </ReadMoreBlock>
                          </TabsContent>
                          <TabsContent value="markdown-raw">
                            <ReadMoreBlock className="text-sm/6 tracking-wide text-foreground">
                              <dd
                                dangerouslySetInnerHTML={{
                                  __html:
                                    jobLead.optimization?.resumeRevision?.markdown.replace(
                                      /(?:\r\n|\r|\n)/g,
                                      '<br />',
                                    ),
                                }}
                              />
                            </ReadMoreBlock>
                          </TabsContent>
                        </div>
                      </Tabs>
                    )}
                  </dl>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No revisions available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </Page>
  );
}
