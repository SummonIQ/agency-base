import { ResumeOptimization, ResumeOptimizationStatus } from '@prisma/client';
import { CalendarIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { unauthorized } from 'next/navigation';

import { DateLabel } from '@/components/data/date-label';
import {
  Field,
  FieldLabel,
  Fields,
  FieldValue,
} from '@/components/data/fields';
import { MarkdownPreview } from '@/components/data/markdown-preview';
import {
  Metadata,
  MetadataIcon,
  MetadataLabel,
} from '@/components/data/metadata-list';
import {
  Page,
  PageActions,
  PageContent,
  PageHeader,
  PageMetadata,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { DeleteResumeButton } from '@/components/resumes/delete-resume-button';
import { ShareResumeButton } from '@/components/resumes/share-resume-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardSummary,
  CardTitle,
} from '@/components/ui/card';
import { ReadMoreBlock } from '@/components/ui/read-more-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/css';
import { getUserResume } from '@/lib/resumes';
import { deleteResume } from '@/lib/resumes/delete';
import { getSessionUser } from '@/lib/user';
import { Resume, ResumeAnalysis, ResumeRevision } from '@/types/domain/resume';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Download } from 'lucide-react';
export default async function ResumeDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user?.id) {
    return unauthorized();
  }

  const resume = (await getUserResume({
    id,
    include: {
      analysis: true,
      optimization: {
        include: {
          resumeRevision: true,
        },
      },
      revisions: true,
    },
    userId: user.id,
  })) as Resume & {
    analysis: ResumeAnalysis;
    optimization: ResumeOptimization & {
      analysis: ResumeAnalysis;
      resumeRevision: ResumeRevision;
    };
    revisions: Array<ResumeRevision & { optimization: ResumeOptimization }>;
  };

  if (!resume) {
    return { notFound: true };
  }

  // Find the default revision to use for the “optimized” tab.
  // const revision = resume?.revisions?.find(
  //   r => r.id === resume.defaultRevisionId,
  // );
  const resumeAnalysis: ResumeAnalysis = resume.analysis;

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle className="flex flex-row items-center gap-3">
            {resume.name}

            <Badge
              className="gap-x-1 rounded-md border-none bg-yellow-500/10 px-2 py-1 text-sm "
              variant="outline"
            >
              <StarFilledIcon className="size-[15px] text-yellow-500/80" />
              <span className="text-sm font-extrabold leading-normal tracking-normal text-yellow-500/90">
                Default
              </span>
            </Badge>
          </PageTitle>
          <PageMetadata>
            <Metadata>
              <MetadataIcon>
                <CalendarIcon
                  aria-hidden="true"
                  className="-mt-px size-[18px] shrink-0 opacity-80"
                />
              </MetadataIcon>
              <MetadataLabel>
                <span>
                  Uploaded on{' '}
                  <DateLabel
                    className="font-semibold"
                    date={resume.createdAt}
                  />
                </span>
              </MetadataLabel>
            </Metadata>
          </PageMetadata>
        </PageSummary>
        <PageActions>
          <div className="flex space-x-2">
            <ShareResumeButton
              resumeId={resume.id}
              resumeName={resume.name}
            />
            <DeleteResumeButton
              deleteResume={async resumeId => {
                'use server';
                await deleteResume(resumeId);
              }}
              redirectTo="/profile"
              resumeId={resume.id}
            />
            {/* 
            <SetDefaultResumeButton
              isDefault={dbUser.defaultResumeId === resume.id}
              resumeId={resume.id}
              save={async resumeId => {
                'use server';
                await setUserDefaultResume(resumeId);
              }}
            /> */}
          </div>
        </PageActions>
      </PageHeader>

      <PageContent>
        <Tabs defaultValue="original-resume">
          <TabsList>
            <TabsTrigger value="original-resume">Original Resume</TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-1.5"
              value="optimized-resume"
            >
              {resume.optimization?.status ===
              ResumeOptimizationStatus.FAILED ? (
                <>
                  <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
                  Optimized Resume
                </>
              ) : (
                'Optimized Resume'
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── ORIGINAL RESUME ───────────────────────────────────────────── */}
          <TabsContent className="space-y-6" value="original-resume">
            <Card>
              <CardHeader>
                <CardSummary>
                  <CardTitle>Original Resume</CardTitle>
                </CardSummary>
                <CardActions>
                  <ShareResumeButton
                    resumeId={resume.id}
                    resumeName={`${resume.name} (Original)`}
                    size="sm"
                  />
                  <Link
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    href={resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Link>
                </CardActions>
              </CardHeader>
              <CardContent className="p-0 md:p-0">
                <Fields>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <FieldValue>{resume.description}</FieldValue>
                  </Field>
                </Fields>

                {resume.markdown ? (
                  <Tabs defaultValue="markdown-preview">
                    <div className="p-4 pb-0 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="pt-0.5 text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                          Markdown
                        </span>

                        <TabsList className="mt-0.5">
                          <TabsTrigger value="markdown-preview">
                            Preview
                          </TabsTrigger>
                          <TabsTrigger value="markdown-raw">Raw</TabsTrigger>
                        </TabsList>
                      </div>
                    </div>
                    <TabsContent className="p-4 pt-0" value="markdown-preview">
                      <ReadMoreBlock className="bg-muted/80 p-6 rounded-lg border border-border shadow-inner">
                        <MarkdownPreview
                          className="rounded-sm border border-border bg-background p-10 drop-shadow-lg"
                          markdown={resume.markdown}
                        />
                      </ReadMoreBlock>
                    </TabsContent>
                    <TabsContent value="markdown-raw">
                      <ReadMoreBlock>
                        <div
                          className="text-sm text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: resume.markdown.replace(
                              /(?:\r\n|\r|\n)/g,
                              '<br />',
                            ),
                          }}
                        />
                      </ReadMoreBlock>
                    </TabsContent>
                  </Tabs>
                ) : null}
              </CardContent>
            </Card>

            {resume.analysis ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1 sm:grid-cols-2">
                      <Field className="col-span-1 sm:col-span-2">
                        <FieldLabel>Summary</FieldLabel>
                        <FieldValue>{resume.analysis.summary}</FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>ATS Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resume.analysis.score}
                        </FieldValue>
                      </Field>

                      <Field className="col-span-1">
                        <FieldLabel>Strengths</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resume.analysis.strengths.map(s => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field className="col-span-1">
                        <FieldLabel>Weaknesses</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resume.analysis.weaknesses.map(w => (
                              <li key={w}>{w}</li>
                            ))}
                          </ul>
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>

                {/* Grammar & Spelling */}
                <Card>
                  <CardHeader>
                    <CardTitle>Grammar &amp; Spelling</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1 sm:grid-cols-2">
                      <Field className="sm:col-span-1">
                        <FieldLabel>Grammar Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resumeAnalysis.grammar.score}
                        </FieldValue>
                      </Field>

                      <Field className="sm:col-span-1">
                        <FieldLabel>Spelling Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resumeAnalysis.spelling.score}
                        </FieldValue>
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel>
                          Grammar Issues (
                          {resumeAnalysis.grammar.issues_found ?? 0})
                        </FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.grammar.issues?.length
                              ? resumeAnalysis.grammar.issues.map(issue => {
                                  const key = `${issue.word}-${issue.suggestion}`;

                                  return (
                                    <li key={key}>
                                      {issue.description}
                                      <br />
                                      <span className="text-xs text-muted-foreground">
                                        {issue.example}
                                      </span>
                                      <br />
                                      <span className="text-xs text-foreground">
                                        {issue.suggestion}
                                      </span>
                                    </li>
                                  );
                                })
                              : 'No issues found.'}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel>
                          Spelling Issues (
                          {resumeAnalysis.spelling.issues_found ?? 0})
                        </FieldLabel>
                        <FieldValue>
                          {resumeAnalysis.spelling.issues?.length ? (
                            <ul className="ml-5 list-disc">
                              {resumeAnalysis.spelling.issues.map(
                                (issue, i) => (
                                  <li key={`spelling-${i}`}>
                                    <strong>{issue.word}</strong> should be{' '}
                                    <em>{issue.suggestion}</em>
                                    <br />
                                    <span className="text-xs text-muted-foreground">
                                      {issue.context_sentence}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No issues found.
                            </p>
                          )}
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="sm:grid-cols-2">
                      <Field className="sm:col-span-2">
                        <FieldLabel>Keywords Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resumeAnalysis.keywords.score}
                        </FieldValue>
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel>Summary</FieldLabel>
                        <FieldValue>
                          {resumeAnalysis.keywords.feedback?.length ? (
                            <ul className="ml-5 list-disc">
                              {resumeAnalysis.keywords.feedback.map((fb, i) => (
                                <li key={`feedback-${i}`}>{fb}</li>
                              ))}
                            </ul>
                          ) : (
                            'No feedback found.'
                          )}
                        </FieldValue>
                      </Field>
                      <Field className="sm:col-span-1">
                        <FieldLabel>Missing Keywords</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.keywords.missing.map((kw, i) => (
                              <li key={`missing-${i}`}>{kw}</li>
                            ))}
                          </ul>
                        </FieldValue>
                      </Field>
                      <Field className="sm:col-span-1">
                        <FieldLabel>Overused Keywords</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.keywords.overused.map((kw, i) => (
                              <li key={`overused-${i}`}>{kw}</li>
                            ))}
                          </ul>
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>

                {/* Sections Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sections Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1 sm:grid-cols-2">
                      <Field className="sm:col-span-2">
                        <FieldLabel>Overall Sections Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resumeAnalysis.sections.score}
                        </FieldValue>
                      </Field>

                      {resumeAnalysis.sections.details?.length ? (
                        resumeAnalysis.sections.details.map((detail, i) => (
                          <Field
                            className="col-span-1"
                            key={`section-detail-${i}`}
                          >
                            <FieldLabel>
                              {detail.name} (Score: {detail.score})
                            </FieldLabel>
                            <FieldValue>
                              <ul className="ml-5 list-disc">
                                {detail.feedback.map((fb, j) => (
                                  <li key={`detail-feedback-${j}`}>{fb}</li>
                                ))}
                              </ul>
                            </FieldValue>
                          </Field>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No section issues reported.
                        </p>
                      )}
                    </Fields>
                  </CardContent>
                </Card>

                {/* Formatting & Readability */}
                <Card>
                  <CardHeader>
                    <CardTitle>Formatting &amp; Readability</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1 sm:grid-cols-2">
                      <Field className="sm:col-span-2">
                        <FieldLabel>Formatting Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resumeAnalysis.formatting.score}
                        </FieldValue>
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel>Summary</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.formatting.feedback.map((fb, i) => (
                              <li key={`formatting-fb-${i}`}>{fb}</li>
                            ))}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>Incompatible Elements</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.formatting.incompatible_elements.map(
                              (el, i) => (
                                <li key={`incompat-${i}`}>{el}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>Readability Score</FieldLabel>
                        <FieldValue className="font-mono font-semibold">
                          {resumeAnalysis.readability.score}
                        </FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>Readability Feedback</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.readability.feedback.map(
                              (fb, i) => (
                                <li key={`readability-fb-${i}`}>{fb}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1 sm:grid-cols-2">
                      <Field className="sm:col-span-2">
                        <FieldLabel>Achievements Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {resumeAnalysis.achievements.score}
                        </FieldValue>
                      </Field>
                      <Field>
                        <FieldLabel>Good Examples</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.achievements.good_examples.map(
                              (ex, i) => (
                                <li key={`good-${i}`}>{ex}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>Needs Improvement</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.achievements.needs_improvement.map(
                              (ni, i) => (
                                <li key={`needs-${i}`}>{ni}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields>
                      <Field>
                        <FieldLabel>Priority Fixes</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.recommendations.priority_fixes.map(
                              (fix, i) => (
                                <li key={`priority-${i}`}>{fix}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>Content Enhancements</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.recommendations.content_enhancements.map(
                              (enh, i) => (
                                <li key={`content-${i}`}>{enh}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>

                      <Field>
                        <FieldLabel>Long Term Improvements</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {resumeAnalysis.recommendations.long_term_improvements.map(
                              (lt, i) => (
                                <li key={`longterm-${i}`}>{lt}</li>
                              ),
                            )}
                          </ul>
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No analysis found.
              </p>
            )}
          </TabsContent>

          {/* ─── OPTIMIZED RESUME ───────────────────────────────────────────── */}
          <TabsContent value="optimized-resume">
            {resume.optimization?.status === ResumeOptimizationStatus.FAILED ? (
              <Alert className="my-6" variant="destructive">
                <AlertTitle>Resume Optimization Failed</AlertTitle>
                <AlertDescription>
                  The resume optimization process failed. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {/* Optimized Resume Overview */}
                <Card>
                  <CardHeader className="h-[59px] md:p-3 md:px-5">
                    <CardSummary>
                      <CardTitle>Optimized Resume</CardTitle>
                    </CardSummary>
                    <CardActions>
                      <ShareResumeButton
                        resumeId={resume.id}
                        resumeName={`${resume.name} (Optimized)`}
                        size="sm"
                      />
                      {resume.optimization?.resumeRevision?.wordDocumentUrl && (
                        <Link
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'flex-inline items-center',
                          )}
                          href={
                            resume.optimization?.resumeRevision?.wordDocumentUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Link>
                      )}
                    </CardActions>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1">
                      <Field>
                        <FieldLabel>Description</FieldLabel>
                        <FieldValue>{resume.optimization?.summary}</FieldValue>
                      </Field>
                    </Fields>

                    {resume.optimization?.resumeRevision?.markdown && (
                      <Tabs defaultValue="revision-markdown-preview">
                        <div className="p-4 pb-0 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="pt-1 text-sm/6 font-medium tracking-wide text-muted-foreground/80">
                              Markdown
                            </span>
                            <TabsList className="mt-0.5">
                              <TabsTrigger value="revision-markdown-preview">
                                Preview
                              </TabsTrigger>
                              <TabsTrigger value="revision-markdown-raw">
                                Raw
                              </TabsTrigger>
                            </TabsList>
                          </div>
                        </div>
                        <TabsContent
                          className="p-4 pt-0"
                          value="revision-markdown-preview"
                        >
                          <ReadMoreBlock className="bg-muted/80 p-6 rounded-lg border border-border shadow-inner">
                            <MarkdownPreview
                              className="rounded-sm border border-border bg-background p-10 drop-shadow-lg"
                              markdown={
                                resume.optimization?.resumeRevision?.markdown
                              }
                            />
                          </ReadMoreBlock>
                        </TabsContent>
                        <TabsContent value="revision-markdown-raw">
                          <ReadMoreBlock>
                            <div
                              className="text-sm text-foreground"
                              dangerouslySetInnerHTML={{
                                __html:
                                  resume.optimization?.resumeRevision?.markdown?.replace(
                                    /(?:\r\n|\r|\n)/g,
                                    '<br />',
                                  ),
                              }}
                            />
                          </ReadMoreBlock>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>

                {/* Revision Changes */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Revision Changes (
                      {resume.optimization?.changelog?.length ?? 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 md:pt-5">
                    {resume.optimization?.changelog?.length ? (
                      <ul className="ml-5 list-disc space-y-1">
                        {resume.optimization.changelog.map((change, i) => (
                          <li
                            className="text-sm/6 text-foreground"
                            key={`change-${i}`}
                          >
                            {change}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No changes recorded.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/*  estimatedVisibilityBoost:
                optimizedRevision.confidence_metrics.estimated_visibility_boost,
              optimizationStrategy: optimizedRevision.optimization_strategy,
              previousScore: analysis.score,
              projectedShortlistProbability:*/}

                {/* Score Improvement */}
                {resume.optimization && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Improvements</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 md:p-0">
                      <Fields className="grid-cols-1 sm:grid-cols-2">
                        {resume.optimization?.estimatedVisibilityBoost ? (
                          <Field className="col-span-1">
                            <FieldLabel>Estimated Visibility Boost</FieldLabel>
                            <FieldValue className="font-mono text-lg font-semibold">
                              {resume.optimization?.estimatedVisibilityBoost}
                            </FieldValue>
                          </Field>
                        ) : null}

                        {resume.optimization?.projectedShortlistProbability ? (
                          <Field className="col-span-1">
                            <FieldLabel>
                              Projected Shortlist Probability
                            </FieldLabel>
                            <FieldValue className="font-mono text-lg font-semibold">
                              {
                                resume.optimization
                                  .projectedShortlistProbability
                              }
                            </FieldValue>
                          </Field>
                        ) : null}

                        {resume.optimization?.score ? (
                          <Field className="col-span-1">
                            <FieldLabel>New Score</FieldLabel>
                            <FieldValue className="font-mono text-lg font-semibold">
                              {resume.optimization.score}
                            </FieldValue>
                          </Field>
                        ) : null}
                        {resume.optimization?.scoreImprovement ? (
                          <Field className="col-span-1">
                            <FieldLabel>Score Improvement</FieldLabel>
                            <FieldValue
                              className={cn(
                                resume.optimization?.scoreImprovement > 0
                                  ? 'text-green-500'
                                  : 'text-red-500',
                                'font-mono text-lg font-semibold',
                              )}
                            >
                              {resume.optimization?.scoreImprovement > 0
                                ? '+'
                                : '-'}
                              {resume.optimization?.scoreImprovement}
                            </FieldValue>
                          </Field>
                        ) : null}

                        {resume.optimization?.scorePercentChange ? (
                          <Field className="col-span-1">
                            <FieldLabel>Percent Change</FieldLabel>
                            <FieldValue
                              className={cn(
                                resume.optimization?.scorePercentChange > 0
                                  ? 'text-green-500'
                                  : 'text-red-500',
                                'font-mono text-lg font-semibold',
                              )}
                            >
                              {resume.optimization?.scorePercentChange > 0
                                ? '+'
                                : '-'}
                              {resume.optimization?.scorePercentChange}%
                            </FieldValue>
                          </Field>
                        ) : null}

                        {resume.optimization?.significantImprovements
                          ?.length ? (
                          <Field className="sm:col-span-2">
                            <FieldLabel>Significant Improvements</FieldLabel>
                            <FieldValue>
                              <ul className="ml-5 list-disc">
                                {resume.optimization?.significantImprovements?.map(
                                  (imp, i) => <li key={`imp-${i}`}>{imp}</li>,
                                )}
                              </ul>
                            </FieldValue>
                          </Field>
                        ) : null}
                      </Fields>
                    </CardContent>
                  </Card>
                )}

                {/*   */}
                {/* {revision?.optimization?.scoreImprovement && (
                <Card>
                  <CardHeader>
                    <CardTitle>Score Improvement</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-0">
                    <Fields className="grid-cols-1 sm:grid-cols-2">
                      <Field className="col-span-1">
                        <FieldLabel>New Score</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {revision.optimization.scoreImprovement.new_score}
                        </FieldValue>
                      </Field>
                      <Field className="col-span-1">
                        <FieldLabel>Score Improvement</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {revision.optimization.scoreImprovement.delta}
                        </FieldValue>
                      </Field>
                      <Field className="col-span-1">
                        <FieldLabel>Percent Change</FieldLabel>
                        <FieldValue className="font-mono text-lg font-semibold">
                          {
                            revision.optimization.scoreImprovement
                              .percent_change
                          }
                          %
                        </FieldValue>
                      </Field>

                      <Field className="sm:col-span-2">
                        <FieldLabel>Significant Improvements</FieldLabel>
                        <FieldValue>
                          <ul className="ml-5 list-disc">
                            {revision.optimization?.scoreImprovement.significant_improvements?.map(
                              (imp, i) => <li key={`imp-${i}`}>{imp}</li>,
                            )}
                          </ul>
                        </FieldValue>
                      </Field>
                    </Fields>
                  </CardContent>
                </Card>
              )}} */}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContent>
    </Page>
  );
}
