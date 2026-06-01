import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUser } from "@/lib/user/query";
import { JobBoard, JobSearchStatus } from "@prisma/client";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Clock, Loader2 } from "lucide-react";

export default async function JobSearchDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return notFound();
  }

  const jobSearch = await db.jobSearch.findUnique({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      jobListings: {
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!jobSearch) {
    return notFound();
  }

  // Extract values from metadata
  const metadata = jobSearch.metadata as Record<string, any> | null;
  
  // Format job search status badge
  const getStatusBadge = (status: JobSearchStatus) => {
    switch (status) {
      case JobSearchStatus.QUEUED:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Queued</Badge>;
      case JobSearchStatus.PROCESSING:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Processing</Badge>;
      case JobSearchStatus.COMPLETED:
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      case JobSearchStatus.FAILED:
        return <Badge variant="outline" className="bg-red-50 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/jobs"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Job Search Details</h1>
          <p className="text-muted-foreground">
            Results and status for your job search
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search Information</CardTitle>
            {getStatusBadge(jobSearch.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Search Term</h3>
              <p className="text-lg font-medium">{jobSearch.searchTerm}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
              <p className="text-lg font-medium">{jobSearch.location || "Any Location"}</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Job Type</h3>
              <p>{metadata?.jobType || "Any"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Remote</h3>
              <p>{jobSearch.remote ? "Yes" : "No"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Radius</h3>
              <p>{metadata?.radius ? `${metadata.radius} miles` : "Not specified"}</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Job Board</h3>
              <p>{jobSearch.jobBoard === JobBoard.GOOGLE ? "Google Jobs" : 
                 jobSearch.jobBoard === JobBoard.INDEED ? "Indeed" : 
                 jobSearch.jobBoard === JobBoard.LINKEDIN ? "LinkedIn" : 
                 jobSearch.jobBoard}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p>{formatDistanceToNow(new Date(jobSearch.createdAt), { addSuffix: true })}</p>
            </div>
          </div>

          {jobSearch.status === JobSearchStatus.PROCESSING && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-blue-50 p-4 rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <p>Your search is in progress. Results will appear here as they come in.</p>
            </div>
          )}

          {jobSearch.status === JobSearchStatus.QUEUED && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-yellow-50 p-4 rounded-md">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p>Your search is queued and will begin processing shortly.</p>
            </div>
          )}

          {jobSearch.status === JobSearchStatus.FAILED && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Search Failed</AlertTitle>
              <AlertDescription>
                We were unable to complete your job search. Please try again or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          )}

          {jobSearch.status === JobSearchStatus.COMPLETED && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-green-50 p-4 rounded-md">
              <Check className="h-4 w-4 text-green-500" />
              <p>Your search is complete. {jobSearch.totalJobs || 0} jobs found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {jobSearch.jobListings.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Found Jobs</h2>
          <div className="grid gap-4">
            {jobSearch.jobListings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-2">
                    <Link href={`/jobs/${listing.id}`} className="font-medium hover:underline">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{listing.company}</p>
                    <p className="text-sm">{listing.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Link href="/jobs" className="block">
            <Button>
              View All Jobs
            </Button>
          </Link>
        </div>
      ) : jobSearch.status === JobSearchStatus.COMPLETED ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground">No jobs found matching your search criteria.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
