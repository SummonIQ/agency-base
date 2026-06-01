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
import { IndeedSearchForm } from "@/components/job-search/indeed-search-form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { hasIndeedApiKey } from "@/lib/api/indeed-client";

export const metadata: Metadata = {
  title: "Search Indeed Jobs | Gimme Job",
  description: "Search for jobs on Indeed and track your applications",
};

export default async function IndeedJobSearchPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has Indeed API key
  const hasApiKey = await hasIndeedApiKey();
  
  // Get user's job searches for presets
  const recentSearches = await db.jobSearch.findMany({
    where: {
      userId: user.id,
      provider: "INDEED",
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
          <PageTitle>Search Indeed Jobs</PageTitle>
          <PageDescription>
            Find and apply to job listings from Indeed
          </PageDescription>
        </PageSummary>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6">
          {!hasApiKey && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need to set up your Indeed API key in settings to get the most out of this feature.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardContent className="pt-6">
              <IndeedSearchForm 
                hasApiKey={hasApiKey}
                recentSearches={recentSearchPresets} 
              />
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>
              Search results will include jobs from Indeed that match your criteria.
              <br />
              You can track applications and set up alerts for new matching jobs.
            </p>
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
