"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { JobBoard } from "@prisma/client";
import { searchJobs } from "@/lib/api/linkedin-client";

/**
 * Search for jobs on LinkedIn using the LinkedIn API
 * This provides more accurate and up-to-date results compared to web scraping
 */
export async function searchLinkedInJobsViaAPI({
  jobSearchId,
  searchTerm,
  location,
  limit = 50,
}: {
  jobSearchId: string;
  searchTerm: string;
  location?: string;
  limit?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  try {
    // Update job search status to processing
    await db.jobSearch.update({
      where: { id: jobSearchId },
      data: { status: "PROCESSING", progress: 10 },
    });

    // Fetch jobs from LinkedIn API
    const jobs = await searchJobs(searchTerm, location, limit);
    
    // Update progress
    await db.jobSearch.update({
      where: { id: jobSearchId },
      data: { progress: 50 },
    });

    // Save jobs to database
    if (jobs && jobs.length > 0) {
      const jobListings = jobs.map((job) => ({
        title: job.title,
        company: job.company.name,
        location: job.location.name,
        url: job.url,
        description: job.description,
        jobBoard: JobBoard.LINKEDIN,
        jobSearchId,
        userId: user.id,
        jobId: job.id,
        applyOptions: {
          easyApply: job.easyApply,
          applyUrl: job.applyUrl,
        },
        postedAt: job.listedAt,
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

    return jobs.length;
  } catch (error) {
    console.error("LinkedIn API job search failed:", error);
    
    // Update job search status to error
    await db.jobSearch.update({
      where: { id: jobSearchId },
      data: { 
        status: "ERROR",
        endedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error"
      },
    });
    
    throw error;
  }
}

/**
 * Check if the user has valid LinkedIn credentials
 */
export async function hasLinkedInCredentials(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const integration = await db.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId: user.id,
          provider: "LINKEDIN",
        },
      },
    });

    return !!integration;
  } catch (error) {
    console.error("Error checking LinkedIn credentials:", error);
    return false;
  }
}
