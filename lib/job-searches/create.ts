'use server';

import { JobBoard, type JobSearch, JobSearchStatus } from '@prisma/client';
import { after } from 'next/server';

import { revalidateTag } from '@/lib/cache';
import { db } from '@/lib/db';
import { getPrivateUserChannel } from '@/lib/events/channels';
import { sendDataUpdate } from '@/lib/events/data-update';
import { scrapeGoogleListings } from '@/lib/job-searches/services/google';
import { searchIndeedJobsViaAPI } from '@/lib/job-searches/services/indeed-api';
import { getCurrentUser } from '@/lib/user';
import { DataEventType } from '@/types/events';
import { triggerJobSearchCompletionNotification } from '@/lib/notifications/triggers';

export async function createJobSearch({
  location,
  pageDelay = 5000,
  jobBoard,
  remote = false,
  searchTerm,
  radius,
  jobType,
  fromage,
  sortBy,
  provider,
  saveSearch = true,
}: {
  jobBoard?: JobBoard;
  location?: string;
  pageDelay?: number;
  remote?: boolean;
  searchTerm: string;
  radius?: number;
  jobType?: string | null;
  fromage?: number;
  sortBy?: string;
  provider?: string;
  saveSearch?: boolean;
}): Promise<{ success: boolean; jobSearchId?: string; error?: string }> {
  // 'use server' directive is now at the top of the file

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const userChannel = getPrivateUserChannel(user.id);
    
    // Handle different providers appropriately
    const actualJobBoard = provider === 'INDEED' ? 'INDEED' : jobBoard;
    
    // Create the job search record with valid fields only
    // Store additional parameters in metadata
    const jobSearch = await db.jobSearch.create({
      data: {
        jobBoard: actualJobBoard as JobBoard,
        location,
        pageDelay,
        remote,
        searchTerm,
        status: JobSearchStatus.QUEUED,
        metadata: {
          // Store additional fields that aren't in the schema
          radius,
          jobType,
          sortBy,
          provider: provider || actualJobBoard as string,
          saved: saveSearch
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

  revalidateTag(`user:${user.id}:report:job-searches`);
  revalidateTag(`user:${user.id}:job-searches`);
  revalidateTag(`user:${user.id}:job-searches:queue`);
  revalidateTag(`user:${user.id}:job-searches:count`);

  // Update the job search status to processing
  await db.jobSearch.update({
    where: { id: jobSearch.id },
    data: { status: JobSearchStatus.PROCESSING }
  });
  
  // Send update to client
  sendDataUpdate({
    channel: userChannel,
    payload: {
      data: {
        id: jobSearch.id,
        jobListingsCount: 0,
        progress: 10,
        searchTerm,
        status: JobSearchStatus.PROCESSING,
      },
      type: DataEventType.JOB_SEARCH_PROGRESS,
    },
  });

  after(async () => {
    try {
      if (provider === 'INDEED' || actualJobBoard === 'INDEED') {
        // Use Indeed API to search for jobs
        await searchIndeedJobsViaAPI({
          jobSearchId: jobSearch.id,
          searchTerm,
          location,
          radius: radius || 25,
          limit: 25,
          jobType: jobType || undefined,
        });
      } else {
        // Handle other job board types
        switch (actualJobBoard) {
          case JobBoard.CAREER_BUILDER: {
            // await scrapeCareerBuilderListings({
            //   jobSearchId: jobSearch.id,
            //   location,
            //   pageDelay,
            //   remote,
            //   searchTerm,
            // });
            break;
          }
          case JobBoard.GOOGLE: {
            await scrapeGoogleListings({
              jobSearchId: jobSearch.id,
              location,
              pageDelay,
              remote,
              searchTerm,
            });
            break;
          }
          default: {
            // Update job search status to failed if no valid method found
            await db.jobSearch.update({
              where: { id: jobSearch.id },
              data: { 
                status: JobSearchStatus.FAILED,
                endedAt: new Date()
              },
            });
            
            // Send failure notification
            await triggerJobSearchCompletionNotification(
              user.id,
              jobSearch.id,
              searchTerm,
              actualJobBoard as string || 'Unknown',
              0,
              0,
              0,
              'failed',
              `Invalid job board or provider: ${actualJobBoard}`
            );
            
            // Log error information
            console.error(`Invalid job board or provider: ${actualJobBoard}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing job search:', error);
      
      // Update job search status to failed
      await db.jobSearch.update({
        where: { id: jobSearch.id },
        data: { 
          status: JobSearchStatus.FAILED,
          endedAt: new Date()
        },
      });
      
      // Log error information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Job search failed: ${errorMessage}`);
      
      // Send failure notification
      await triggerJobSearchCompletionNotification(
        user.id,
        jobSearch.id,
        searchTerm,
        actualJobBoard as string || provider || 'Unknown',
        0,
        0,
        0,
        'failed',
        errorMessage
      );
      
      // Send failure update to client
      sendDataUpdate({
        channel: userChannel,
        payload: {
          data: {
            id: jobSearch.id,
            jobListingsCount: 0,
            progress: 0,
            searchTerm,
            status: JobSearchStatus.FAILED,
          },
          type: DataEventType.JOB_SEARCH_PROGRESS,
        },
      });
      
      // Additionally log the error message for debugging
      console.error(`Job search ${jobSearch.id} failed with error: ${errorMessage}`);
    }
  });

  return { success: true, jobSearchId: jobSearch.id };

  } catch (error) {
    console.error('Error creating job search:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create job search' 
    };
  }
}
