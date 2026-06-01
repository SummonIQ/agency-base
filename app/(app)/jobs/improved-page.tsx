import { JobBoard, JobListing, JobListingStatus, Prisma } from '@prisma/client';
import type { Metadata } from 'next';
import { unauthorized } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

import { JobListingsReport } from '@/components/job-listings/job-listings-report';
import { JobListingsFilters } from '@/components/job-listings/job-listings-filters';
import { JobRecommendations } from '@/components/job-listings/job-recommendations';
import { SavedSearches } from '@/components/job-search/saved-searches';
import { JobSearchQueue } from '@/components/job-searches/job-search-queue';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageSummary,
  PageTitle,
} from '@/components/layout/page';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createJobLeads } from '@/lib/job-leads';
import {
  dismissJobListings,
  saveJobListings,
  unsaveJobListings,
} from '@/lib/job-listings';
import { createJobSearch, getQueuedJobSearches } from '@/lib/job-searches';
import { getReportData } from '@/lib/reporting';
import { getCurrentUser } from '@/lib/user';
import { ApiQuery } from '@/types/reporting/query';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  description: 'Search for and view job details.',
  title: 'Job Listings | Gimme Job',
};

// Mock function to get job recommendations
async function getJobRecommendations(userId: string) {
  // In a real implementation, this would use AI/ML to recommend jobs
  const recentJobs = await db.jobListing.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return recentJobs.map(job => ({
    ...job,
    matchScore: Math.floor(Math.random() * 40) + 60, // 60-100
    matchReasons: [
      'Matches your skills',
      'Similar to previous applications',
      'In your preferred location',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
  }));
}

// Get saved searches
async function getSavedSearches(userId: string) {
  const searches = await db.jobSearch.findMany({
    where: {
      userId,
      savedSearch: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  return searches.map(search => ({
    id: search.id,
    name: search.searchTerm || search.query,
    query: search.query,
    location: search.location,
    radius: search.radius,
    jobType: search.jobType,
    remote: search.remote,
    alertsEnabled: false, // This would come from user preferences
    lastRun: search.updatedAt,
    newJobsCount: 0, // This would be calculated
    totalJobsCount: search.totalJobs || 0,
    createdAt: search.createdAt,
  }));
}

export default async function ImprovedJobListingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return unauthorized();
  }

  const queuedJobSearches = await getQueuedJobSearches({
    include: {
      jobListingsCount: true,
    },
    userId: user.id,
  });

  const initialQuery: ApiQuery<JobListing, Prisma.JobListingInclude> = {
    filters: [
      {
        field: 'status',
        operator: 'in',
        value: [JobListingStatus.UNREVIEWED],
      },
    ],
    pagination: {
      count: 10,
      start: 0,
    },
    sort: [{ direction: 'desc', field: 'createdAt' }],
  };

  const { data, pagination } = await getReportData({
    apiQuery: initialQuery,
    model: 'job-listings',
    userId: user.id,
  });
  
  const jobListings = data as JobListing[];
  const recommendations = await getJobRecommendations(user.id);
  const savedSearches = await getSavedSearches(user.id);

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Job Hub</PageTitle>
          <PageDescription>
            Find, track, and apply to jobs that match your career goals.
          </PageDescription>
        </PageSummary>
        <PageActions>
          <Link href="/jobs/search" className="inline-flex">
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              New Job Search
            </Button>
          </Link>
        </PageActions>
      </PageHeader>
      
      <PageContent>
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">All Jobs</TabsTrigger>
            <TabsTrigger value="recommendations">For You</TabsTrigger>
            <TabsTrigger value="saved">Saved Searches</TabsTrigger>
            <TabsTrigger value="queue">Search Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <JobListingsFilters
                      filters={{}}
                      onFiltersChange={(filters) => {
                        // Handle filter changes
                        console.log('Filters changed:', filters);
                      }}
                      onReset={() => {
                        // Handle filter reset
                        console.log('Filters reset');
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="bg-accent/30 p-2 md:p-2">
                    <JobListingsReport
                      addToLeads={async ids => {
                        'use server';
                        await createJobLeads(ids);
                      }}
                      dismiss={async ids => {
                        'use server';
                        await dismissJobListings(ids);
                      }}
                      initialData={jobListings}
                      initialQuery={initialQuery}
                      save={async ids => {
                        'use server';
                        await saveJobListings(ids);
                      }}
                      showExport={true}
                      showPagination={true}
                      showSearch={true}
                      showColumnToggle={true}
                      totalCount={pagination.total}
                      unsave={async ids => {
                        'use server';
                        await unsaveJobListings(ids);
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <JobRecommendations
                  recommendations={recommendations}
                  onSave={async (jobId) => {
                    'use server';
                    await saveJobListings([jobId]);
                  }}
                  onFeedback={async (jobId, isPositive) => {
                    'use server';
                    // Handle feedback
                    console.log('Feedback:', jobId, isPositive);
                  }}
                />
              </div>
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4">Your Job Search Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Jobs Viewed</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Applications Sent</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interviews</span>
                        <span className="font-medium">4</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Improve Recommendations */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4">Improve Recommendations</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Help us find better matches for you
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Update job preferences
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add skills to profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <SavedSearches
              searches={savedSearches}
              onRunSearch={async (searchId) => {
                'use server';
                // Re-run the saved search
                const search = await db.jobSearch.findUnique({
                  where: { id: searchId },
                });
                if (search) {
                  await createJobSearch({
                    query: search.query,
                    location: search.location,
                    radius: search.radius,
                    jobType: search.jobType,
                    remote: search.remote,
                    jobBoard: search.jobBoard,
                    saveSearch: true,
                  });
                }
              }}
              onToggleAlerts={async (searchId, enabled) => {
                'use server';
                // Toggle alerts for the search
                console.log('Toggle alerts:', searchId, enabled);
              }}
              onEditSearch={async (search) => {
                'use server';
                // Update the search name
                await db.jobSearch.update({
                  where: { id: search.id },
                  data: { searchTerm: search.name },
                });
              }}
              onDeleteSearch={async (searchId) => {
                'use server';
                // Delete the saved search
                await db.jobSearch.delete({
                  where: { id: searchId },
                });
              }}
            />
          </TabsContent>

          <TabsContent value="queue" className="space-y-6">
            <Suspense fallback={<></>}>
              <JobSearchQueue queue={queuedJobSearches} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </PageContent>
    </Page>
  );
}