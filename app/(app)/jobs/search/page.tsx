import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
  PageDescription,
  PageSummary,
} from "@/components/layout/page";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { JobSearchForm } from "@/components/job-search/job-search-form";

export const metadata: Metadata = {
  title: "Search Jobs | Gimme Job",
  description: "Find and apply to job listings with our powerful search tool",
};

export default async function JobSearchPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  
  // Get user's job searches for presets
  const recentSearches = await db.jobSearch.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const recentSearchPresets = recentSearches.map(search => ({
    id: search.id,
    query: search.query,
    location: search.location || undefined,
    radius: search.radius || undefined,
  }));

  return (
    <Page>
      <PageHeader>
        <PageSummary>
          <PageTitle>Search Jobs</PageTitle>
          <PageDescription>
            Find job opportunities that match your skills and interests
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <JobSearchForm 
                recentSearches={recentSearchPresets} 
              />
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>
              Search results will include jobs matching your criteria from multiple sources.
              <br />
              You can track applications and set up alerts for new matching jobs.
            </p>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
