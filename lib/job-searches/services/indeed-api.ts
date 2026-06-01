"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { JobBoard } from "@prisma/client";
import { searchJobs } from "@/lib/api/indeed-client";
import { triggerJobSearchCompletionNotification } from "@/lib/notifications/triggers";

/**
 * Search for jobs on Indeed using the Indeed API
 */
export async function searchIndeedJobsViaAPI({
  jobSearchId,
  searchTerm,
  location,
  radius = 25,
  limit = 25,
  jobType,
}: {
  jobSearchId: string;
  searchTerm: string;
  location?: string;
  radius?: number;
  limit?: number;
  jobType?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");
  
  const startTime = Date.now();

  try {
    // Update job search status to processing
    await db.jobSearch.update({
      where: { id: jobSearchId },
      data: { status: "PROCESSING", progress: 10 },
    });

    // Fetch jobs from Indeed API
    const jobs = await searchJobs({
      q: searchTerm,
      l: location,
      limit,
      radius,
      jt: jobType,
    });
    
    // Update progress
    await db.jobSearch.update({
      where: { id: jobSearchId },
      data: { progress: 50 },
    });

    // Save jobs to database
    if (jobs && jobs.length > 0) {
      const jobListings = jobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        jobBoard: JobBoard.INDEED,
        jobSearchId,
        userId: user.id,
        jobId: job.id,
        applyOptions: {
          applyUrl: job.applyUrl,
        },
        postedAt: job.postedDate,
        jobType: job.jobType,
        remote: job.remote,
      }));

      // Create job listings in batches to avoid timeout
      const batchSize = 25;
      for (let i = 0; i < jobListings.length; i += batchSize) {
        const batch = jobListings.slice(i, i + batchSize);
        await db.jobListing.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }
    }

    // Mark job search as completed
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    await db.jobSearch.update({
      data: { 
        completedAt: new Date(),
        endedAt: new Date(),
        progress: 100,
        status: "COMPLETED",
        totalJobs: jobs.length
      },
      where: { id: jobSearchId },
    });

    // Send completion notification
    await triggerJobSearchCompletionNotification(
      user.id,
      jobSearchId,
      searchTerm,
      'Indeed',
      jobs.length,
      jobs.length, // All jobs are new since we don't dedupe within this function
      duration,
      'completed'
    );

    return jobs.length;
  } catch (error) {
    console.error("Indeed API job search failed:", error);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Update job search status to error
    await db.jobSearch.update({
      where: { id: jobSearchId },
      data: { 
        status: "ERROR",
        endedAt: new Date(),
        error: errorMessage
      },
    });
    
    // Send failure notification
    await triggerJobSearchCompletionNotification(
      user.id,
      jobSearchId,
      searchTerm,
      'Indeed',
      0,
      0,
      duration,
      'failed',
      errorMessage
    );
    
    throw error;
  }
}

/**
 * Check if the user has valid Indeed API credentials
 */
export async function hasIndeedCredentials(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const integration = await db.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: "INDEED",
        },
      },
    });

    return !!integration;
  } catch (error) {
    console.error("Error checking Indeed credentials:", error);
    return false;
  }
}
