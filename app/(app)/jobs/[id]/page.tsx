import { JobBoard, JobListingStatus } from '@prisma/client';
import { CalendarIcon } from '@radix-ui/react-icons';
import type { Metadata as NextMetadata } from 'next';
import Link from 'next/link';

import { LinkedInTools } from '@/components/job-tools/linkedin-tools';
import { ApplyButton } from '@/components/job-applications/apply-button';

import { DateLabel } from '@/components/data/date-label';
import {
  Metadata,
  MetadataIcon,
  MetadataLabel,
} from '@/components/data/metadata-list';
import { AddJobListingToLeadsButton } from '@/components/job-leads/add-job-lead-button';
import { DismissJobListingButton } from '@/components/job-listings/dismiss-job-listing-button';
import { SaveJobListingButton } from '@/components/job-listings/save-job-listing-button';
import { ShareJobLeadButton } from '@/components/job-leads/share-job-lead-button';
import {
  Page,
  PageActions,
  PageContent,
  PageHeader,
  PageMetadata,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { ReadMoreBlock } from '@/components/ui/read-more-block';
import { createJobLead } from '@/lib/job-leads';
import {
  dismissJobListing,
  getJobListing,
  saveJobListing,
  unsaveJobListing,
} from '@/lib/job-listings';
import { getCurrentUser } from '@/lib/user';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<NextMetadata> {
  const id = (await params).id;
  const user = await getCurrentUser();
  const job = await getJobListing({ id, userId: user.id });

  if (!job) {
    return {
      description: 'View job details',
      title: 'Job Details | gimmejob',
    };
  }

  return {
    description: job?.description?.slice(0, 32),
    title: `${job.title} | gimmejob`,
  };
}

export default async function JobListingDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const user = await getCurrentUser();
  const id = (await params).id;
  const job = await getJobListing({ id, userId: user.id });

  if (!job) {
    return {
      notFound: true,
    };
  }

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>{job?.title}</PageTitle>

          {job?.postedAt ? (
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
                    Listed on{' '}
                    <DateLabel
                      className="font-semibold"
                      date={job?.postedAt instanceof Date ? job?.postedAt.toISOString() : new Date(job?.postedAt).toISOString()}
                    />
                  </span>
                </MetadataLabel>
              </Metadata>
            </PageMetadata>
          ) : null}
        </PageSummary>

        <PageActions>
          <div className="flex space-x-2">
            <ApplyButton 
              jobId={job.id}
              jobBoard={job.jobBoard}
              applyUrl={(job.applyOptions as any)?.applyUrl || job.url}
            />
            <LinkedInTools jobLeadId={job.id} variant="secondary" />
            <SaveJobListingButton
              jobListingId={job.id}
              save={async id => {
                'use server';

                const result = await saveJobListing(id);
                return result;
              }}
              saved={job.saved}
              unsave={async id => {
                'use server';

                const result = await unsaveJobListing(id);
                return result;
              }}
            />
            {job.status === JobListingStatus.ADDED_TO_LEADS && (
              <ShareJobLeadButton jobLeadId={job.id} jobTitle={job.title} />
            )}
          </div>
        </PageActions>
      </PageHeader>
      <PageContent>
        <Card>
          <CardHeader>
            <CardSummary>
              <CardTitle>Job Details</CardTitle>
            </CardSummary>

            <CardActions>
              {job.status !== JobListingStatus.ADDED_TO_LEADS ? (
                <DismissJobListingButton
                  dismiss={async id => {
                    'use server';

                    const result = await dismissJobListing(id);
                    return result;
                  }}
                  isDismissed={job.status === JobListingStatus.DISMISSED}
                  jobListingId={job.id}
                />
              ) : null}

              {job.status !== JobListingStatus.DISMISSED ? (
                <AddJobListingToLeadsButton
                  addToLeads={async id => {
                    'use server';

                    const result = await createJobLead({
                      jobListingId: id,
                    });
                    return result;
                  }}
                  hasDefaultResume={!!user.defaultResumeId}
                  isLead={job.status === JobListingStatus.ADDED_TO_LEADS}
                  jobListingId={job.id}
                />
              ) : null}
            </CardActions>
          </CardHeader>
          <CardContent className="flex-col p-0 md:p-0">
            <dl className="grid grid-cols-1 sm:grid-cols-2">
              {job?.description ? (
                <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Description
                  </dt>

                  <ReadMoreBlock className="text-pretty text-sm/6 tracking-wide text-foreground">
                    <dd
                      className=" text-pretty text-sm/6 tracking-wide text-foreground"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                      dangerouslySetInnerHTML={{
                        __html: job?.description
                          .replace(/(?:\r\n|\r|\n)/g, '<br />')
                          .replace(/(?:\*|\n)/g, '<br />'),
                      }}
                    />
                  </ReadMoreBlock>
                </div>
              ) : null}

              {job?.company ? (
                <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-1 md:p-5 ">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Company
                  </dt>
                  <dd className="flex flex-row items-center truncate text-sm/6 font-medium text-foreground sm:mt-2">
                    {job?.companyLogoUrl ? (
                      <img
                        alt={job?.company}
                        className="mr-3 h-12 max-h-24 rounded-sm border border-border"
                        src={job?.companyLogoUrl}
                      />
                    ) : null}

                    <span>{job?.company}</span>
                  </dd>
                </div>
              ) : null}

              {job?.location ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Location
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.location}
                  </dd>
                </div>
              ) : null}

              {job?.salary ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Salary
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.salary}
                  </dd>
                </div>
              ) : null}

              {job?.remote ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Remote
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.remote ? 'Yes' : 'No'}
                  </dd>
                </div>
              ) : null}

              {job?.jobBoard ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Job board
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.jobBoard === JobBoard.CAREER_BUILDER ? (
                      <span>CareerBuilder</span>
                    ) : job?.jobBoard === JobBoard.GOOGLE ? (
                      <span>Google Jobs</span>
                    ) : null}
                  </dd>
                </div>
              ) : null}

              {job?.jobBoardUrl ? (
                <div className="border-b border-border p-4 sm:col-span-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    URL
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 sm:mt-2">
                    <Link
                      className="text-primary underline underline-offset-2"
                      href={job?.jobBoardUrl}
                    >
                      {job?.jobBoardUrl}
                    </Link>
                  </dd>
                </div>
              ) : null}

              {job?.healthInsurance ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Health Insurance
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.healthInsurance ? 'Yes' : 'No'}
                  </dd>
                </div>
              ) : null}

              {job?.dentalCoverage ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Dental Coverage
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.dentalCoverage ? 'Yes' : 'No'}
                  </dd>
                </div>
              ) : null}

              {job?.paidTimeOff ? (
                <div className="border-b border-border/60 p-4 sm:col-span-1 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Paid Time Off
                  </dt>
                  <dd className="mt-1 truncate text-sm/6 text-foreground sm:mt-2">
                    {job?.paidTimeOff ? 'Yes' : 'No'}
                  </dd>
                </div>
              ) : null}

              {job?.requirements && job.requirements.length > 0 ? (
                <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Requirements
                  </dt>
                  <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                    <ul className="list-disc space-y-1 pl-6">
                      {job?.requirements.map((requirement, i) => (
                        <li
                          className="text-pretty text-sm/5"
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={`${requirement}-${i}`}
                        >
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}

              {job?.responsibilities && job.responsibilities.length > 0 ? (
                <div className="border-b border-border/60 p-4 sm:col-span-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Responsibilities
                  </dt>
                  <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                    <ul className="list-disc space-y-2.5 pl-6">
                      {job?.responsibilities.map((responsibility, i) => (
                        <li
                          className="text-pretty text-sm/5"
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={`${responsibility}-${i}`}
                        >
                          {responsibility}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}

              {job?.qualifications && job.qualifications.length > 0 ? (
                <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Qualifications
                  </dt>
                  <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                    <ul className="list-disc space-y-2.5 pl-6">
                      {job?.qualifications.map((qualification, i) => (
                        <li
                          className="text-pretty text-sm/5"
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={`${qualification}-${i}`}
                        >
                          {qualification}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}

              {job?.benefits && job.benefits.length > 0 ? (
                <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Benefits
                  </dt>
                  <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                    <ul className="list-disc space-y-2.5 pl-6">
                      {job?.benefits.map((benefit, i) => (
                        <li
                          className="text-pretty text-sm/5"
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={`${benefit}-${i}`}
                        >
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}

              {job?.applyOptions && Array.isArray(job.applyOptions) && job.applyOptions.length > 0 ? (
                <div className="space-y-1 border-b border-border/60 p-4 sm:col-span-2 sm:space-y-2 md:p-5">
                  <dt className="text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                    Apply Options
                  </dt>
                  <dd className="mt-1 w-full sm:mt-2 md:mt-3">
                    <ul className="list-disc space-y-2.5 pl-6">
                      {(job?.applyOptions as Array<{ link: string; method: string; buttonText?: string }>).map((applyOption, i: number) => (
                        <li
                          className="text-pretty text-sm/5"
                          key={`${applyOption.link}-${i}`}
                        >
                          <h4 className="font-semibold">
                            {
                              (
                                applyOption as {
                                  title: string;
                                  url: string;
                                }
                              ).title
                            }
                          </h4>

                          <Link
                            className="block truncate text-primary underline underline-offset-2"
                            href={
                              (applyOption as { link: string; title: string })
                                .link
                            }
                          >
                            {
                              (applyOption as { link: string; title: string })
                                .link
                            }
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  );
}
