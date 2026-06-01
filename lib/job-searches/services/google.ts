import {
  JobBoard,
  JobSearchStatus,
  JobType,
  type Prisma,
} from '@prisma/client';

import { revalidateTag } from '@/lib/cache';
import { db } from '@/lib/db';
import { getPrivateUserChannel } from '@/lib/events/channels';
import { sendDataUpdate } from '@/lib/events/data-update';
import { parseRelativeTimeToDate } from '@/lib/time';
import { getCurrentUser } from '@/lib/user';
import type { SerpApiJobSearchResultsResponse } from '@/types/api/serp-api';
import { DataEventType } from '@/types/events/data-update';
import { type JobSearchUpdatePayload } from '@/types/job-search/event';

const getJobType = (scheduleType?: string) => {
  switch (scheduleType) {
    case 'Full-time':
      return JobType.FULL_TIME;
    case 'Part-time':
      return JobType.PART_TIME;
    case 'Full-time and Part-time':
      return JobType.FULL_TIME_AND_PART_TIME;
    default:
      return JobType.UNKNOWN;
  }
};

// Helper: update job search progress with more detailed information
async function updateJobSearch({
  jobSearchId,
  progress = undefined,
  nextPageToken,
  userId,
  statusMessage,
  jobsFound,
}: {
  jobSearchId: string;
  nextPageToken?: string;
  progress?: number;
  userId: string;
  statusMessage?: string;
  jobsFound?: number;
}) {
  try {
    // Using a raw query for minimal overhead to update basic progress
    if (progress !== undefined) {
      await db.$executeRaw`UPDATE JobSearch SET progress = ${progress} WHERE id = ${jobSearchId}`;
    }
    
    // Update next page token if provided
    if (nextPageToken) {
      await db.$executeRaw`UPDATE JobSearch SET nextPageToken = ${nextPageToken} WHERE id = ${jobSearchId}`;
    }
    
    // Update status message and jobs found count if provided
    // This uses the Prisma client for more complex updates
    if (statusMessage || jobsFound !== undefined) {
      const updateData: any = {};
      
      if (statusMessage) {
        // Store the status message in the metadata field as JSON
        const jobSearch = await db.jobSearch.findUnique({
          where: { id: jobSearchId },
          select: { metadata: true }
        });
        
        const metadata = jobSearch?.metadata ? JSON.parse(String(jobSearch.metadata)) : {};
        metadata.statusMessage = statusMessage;
        metadata.lastUpdated = new Date().toISOString();
        
        if (jobsFound !== undefined) {
          metadata.jobsFound = jobsFound;
        }
        
        updateData.metadata = JSON.stringify(metadata);
      }
      
      await db.jobSearch.update({
        where: { id: jobSearchId },
        data: updateData
      });
    }

    // Revalidate cache tags to refresh UI
    revalidateTag(`user:${userId}:job-searches:queue`);
    revalidateTag(`job-search:${jobSearchId}`);
    
    // For real-time updates, use direct cache revalidation instead of event system
    // This avoids type compatibility issues between different event systems
    try {
      // Additional cache tags for immediate UI updates
      revalidateTag(`job-search-progress:${jobSearchId}`);
      revalidateTag(`job-search-status:${jobSearchId}`);
      
      // Update UI with the current jobs found count
      if (jobsFound !== undefined) {
        revalidateTag(`job-search-results:${jobSearchId}`);
      }
    } catch (eventError) {
      console.log('Failed to revalidate cache tags:', eventError);
      // Silent catch to avoid blocking the search process
    }
  } catch (error) {
    // Log error but don't throw to avoid stopping the search process
    console.error('Failed to update job search progress:', error);
  }
}

async function addJobListings({
  jobListings,
  userId,
}: {
  jobListings: Array<Prisma.JobListingCreateManyInput>;
  userId: string;
}) {
  await db.jobListing.createMany({
    data: jobListings,
    skipDuplicates: true,
  });

  revalidateTag(`user:${userId}:job-listings`);
  revalidateTag(`user:${userId}:job-listings:count`);
}

// In-memory cache for job search results
const searchCache = new Map<string, {
  timestamp: number;
  results: Array<Prisma.JobListingCreateManyInput>;
  nextPageToken?: string;
}>();

// Cache expiration time - 15 minutes
const CACHE_EXPIRY_MS = 15 * 60 * 1000;

/**
 * Generate a cache key for a job search based on search parameters
 * This ensures similar searches use the same cache entry
 */
function generateCacheKey(params: {
  searchTerm: string;
  location?: string;
  remote?: boolean;
  page?: number;
}): string {
  // Normalize search term by trimming, converting to lowercase, and removing extra spaces
  const normalizedTerm = params.searchTerm.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Include location if present, normalize it as well
  const locationPart = params.location 
    ? `-${params.location.trim().toLowerCase().replace(/\s+/g, ' ')}` 
    : '';
  
  // Include remote preference
  const remotePart = params.remote ? '-remote' : '';
  
  // Include page number if specified
  const pagePart = params.page ? `-page${params.page}` : '';
  
  return `google-jobs-${normalizedTerm}${locationPart}${remotePart}${pagePart}`;
}

/**
 * Check if cache entry is valid (exists and not expired)
 */
function isCacheValid(cacheKey: string): boolean {
  if (!searchCache.has(cacheKey)) return false;
  
  const cacheEntry = searchCache.get(cacheKey)!;
  const now = Date.now();
  
  // Check if entry has expired
  return (now - cacheEntry.timestamp) < CACHE_EXPIRY_MS;
}

/**
 * Scrape job listings from Google Jobs using SerpAPI
 * Includes caching, retry mechanism, and detailed metadata extraction
 */
export async function scrapeGoogleListings({
  location,
  pageDelay = 5000,
  remote = false,
  jobSearchId,
  searchTerm,
  totalPages = 25,
}: {
  jobSearchId: string;
  location?: string;
  pageDelay?: number;
  remote?: boolean;
  searchTerm: string;
  totalPages?: number;
}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const serpApiKey = process.env.SERP_API_SECRET;

  if (!serpApiKey) {
    throw new Error('SERP_API_KEY is not defined in environment variables.');
  }

  const userChannel = getPrivateUserChannel(user.id);

  let nextPageToken: string | undefined = undefined;
  let retryCount = 0;
  const maxRetries = 3;
  const initialBackoffDelay = 1000; // 1 second initial delay

  // Generate base cache key for this search
  const baseCacheKey = generateCacheKey({ searchTerm, location, remote });
  
  // Helper function to create URL with all available parameters
  const buildSerpApiUrl = (baseParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    
    // Required parameters
    params.append('engine', 'google_jobs');
    params.append('q', searchTerm);
    params.append('api_key', serpApiKey!);
    
    // Optional parameters with nullish coalescing for safety
    if (baseParams.next_page_token) params.append('next_page_token', baseParams.next_page_token);
    if (baseParams.location) params.append('location', baseParams.location);
    
    // Remote work parameter
    if (remote) params.append('ltype', '1');
    
    // Optional refinements - can be extended based on user input
    if (baseParams.chips_date_posted) params.append('chips_date_posted', baseParams.chips_date_posted);
    if (baseParams.chips_job_type) params.append('chips_job_type', baseParams.chips_job_type);
    if (baseParams.chips_experience) params.append('chips_experience', baseParams.chips_experience);
    
    // Add google domain for better results
    params.append('google_domain', 'google.com');
    
    return `https://serpapi.com/search.json?${params.toString()}`;
  };

  // Function to handle retries with exponential backoff
  const fetchWithRetry = async (url: string): Promise<SerpApiJobSearchResultsResponse> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data: SerpApiJobSearchResultsResponse = await response.json();
      
      // Check if the API returned an error
      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }
      
      return data;
    } catch (error) {
      // Only retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        retryCount++;
        
        // Calculate backoff delay with exponential increase
        const backoffDelay = initialBackoffDelay * Math.pow(2, retryCount - 1);
        console.log(`Retrying SerpAPI request attempt ${retryCount} of ${maxRetries} after ${backoffDelay}ms delay`);
        
        // Wait for the backoff period
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        
        // Retry the request
        return fetchWithRetry(url);
      }
      
      // If we've exhausted retries, throw the error
      throw error;
    }
  };

  let totalJobListings = 0;
  
  // Update initial status message
  await updateJobSearch({
    jobSearchId,
    progress: 5,
    statusMessage: `Starting job search for "${searchTerm}"...`,
    userId: user.id,
  });

  for (let page = 1; page <= totalPages; page++) {
    // Reset retry count for each page
    retryCount = 0;
    
    // Generate cache key for this specific page
    const pageCacheKey = generateCacheKey({
      searchTerm,
      location,
      remote,
      page
    });
    
    // Check if we have valid cached results for this page
    let data: SerpApiJobSearchResultsResponse | undefined;
    let useCache = false;
    let pagedJobListings: Array<Prisma.JobListingCreateManyInput> = [];
    
    if (isCacheValid(pageCacheKey)) {
      // Use cached results if available
      const cachedData = searchCache.get(pageCacheKey)!;
      pagedJobListings = cachedData.results;
      nextPageToken = cachedData.nextPageToken;
      useCache = true;
      
      console.log(`Using cached results for "${searchTerm}" page ${page}`);
      
      // Update status to show we're using cached data
      await updateJobSearch({
        jobSearchId,
        statusMessage: `Using cached results for page ${page}...`,
        userId: user.id,
      });
    } else {
      // Build URL with all parameters for fresh request
      const url = buildSerpApiUrl({
        next_page_token: nextPageToken,
        location: location,
        // Example of adding optional refinements
        // chips_date_posted: 'today', // Options: today, 3days, week, month
        // chips_job_type: 'fulltime', // Options: fulltime, parttime, contractor, internship
        // chips_experience: 'entry_level' // Options: entry_level, mid_level, senior_level
      });
      
      // Update status message for fresh fetch
      await updateJobSearch({
        jobSearchId,
        statusMessage: `Fetching jobs page ${page}...`,
        userId: user.id,
      });

      // Fetch data with retry mechanism
      try {
        data = await fetchWithRetry(url);
        
        // Process the data and build job listings
        if (data.jobs_results && Array.isArray(data.jobs_results)) {
          pagedJobListings = [];
          for (const job of data.jobs_results) {
            const {
              apply_options,
              thumbnail,
              company_name,
              description,
              detected_extensions,
              extensions,
              job_highlights,
              job_id,
              location: jobLocation,
              share_link,
              title,
              via,
            } = job;
            
            const {
              posted_at,
              salary,
              schedule_type,
              paid_time_off,
              dental_coverage,
              health_insurance,
              work_from_home,
            } = detected_extensions;
            
            let qualifications: Array<string> = [];
            let requirements: Array<string> = [];
            let benefits: Array<string> = [];
            let responsibilities: Array<string> = [];
            let skills: Array<string> = [];
            let education: Array<string> = [];
            let experience: Array<string> = [];
            let perks: Array<string> = [];
            
            // Extract detailed job highlights with better categorization
            if (job_highlights && Array.isArray(job_highlights)) {
              for (const highlight of job_highlights) {
                const title = highlight.title?.toLowerCase() || '';
                const items = highlight.items || [];
                
                if (title.includes('qualif') || title.includes('skill')) {
                  qualifications = [...qualifications, ...items];
                  
                  // Extract skills from qualifications
                  items.forEach(item => {
                    const lowercaseItem = item.toLowerCase();
                    if (lowercaseItem.includes('experience with') || 
                        lowercaseItem.includes('knowledge of')) {
                      skills.push(item);
                    }
                  });
                } else if (title.includes('requir')) {
                  requirements = [...requirements, ...items];
                } else if (title.includes('benefit')) {
                  benefits = [...benefits, ...items];
                } else if (title.includes('respons')) {
                  responsibilities = [...responsibilities, ...items];
                }
              }
            }
            
            const postedAt = posted_at
              ? parseRelativeTimeToDate(posted_at)?.toISOString()
              : undefined;
            
            pagedJobListings.push({
              applyOptions: (apply_options as unknown as Prisma.JsonArray) ?? [],
              benefits: benefits.length > 0 ? benefits : [],
              company: company_name,
              companyLogoUrl: thumbnail ?? undefined,
              dentalCoverage: dental_coverage ?? undefined,
              description: description ?? 'No description provided',
              detectedExtensions: (detected_extensions ??
                {}) as unknown as Prisma.JsonObject,
              extensions,
              healthInsurance: health_insurance ?? undefined,
              jobBoard: JobBoard.GOOGLE,
              jobBoardUrl: share_link,
              jobId: job_id,
              jobSearchId,
              jobType: getJobType(schedule_type),
              location: jobLocation,
              paidTimeOff: paid_time_off ?? undefined,
              postedAt: postedAt ? new Date(postedAt) : null,
              qualifications:
                qualifications.length > 0 ? qualifications : undefined,
              remote,
              requirements: requirements.length > 0 ? requirements : undefined,
              responsibilities:
                responsibilities.length > 0 ? responsibilities : undefined,
              salary,
              scheduleType: schedule_type,
              source: via,
              title: title,
              userId: user.id,
              workFromHome: work_from_home ?? undefined,
            } as Prisma.JobListingCreateManyInput);
          }
        }
        
        // Store successful results in cache with current timestamp
        searchCache.set(pageCacheKey, {
          timestamp: Date.now(),
          results: pagedJobListings,
          nextPageToken: data?.serpapi_pagination?.next_page_token
        });
        
        // Get next page token from current results
        nextPageToken = data?.serpapi_pagination?.next_page_token;
        
      } catch (error) {
        console.error(`Failed to fetch SerpAPI data after ${maxRetries} attempts:`, error);
        
        // Update search with error status
        await updateJobSearch({
          jobSearchId,
          progress: 100,
          statusMessage: `Error fetching results: ${error instanceof Error ? error.message : 'Unknown error'}`,
          userId: user.id,
        });
        
        // Update job search status to failed
        await db.jobSearch.update({
          data: {
            completedAt: new Date(),
            endedAt: new Date(),
            status: JobSearchStatus.FAILED,
          },
          where: {
            id: jobSearchId,
          },
        });
        
        // Revalidate to show error status
        revalidateTag(`job-search-error:${jobSearchId}`);
        return;
      }
    }

    // Process job listings - add to database
    totalJobListings += pagedJobListings.length;
    await addJobListings({
      jobListings: pagedJobListings,
      userId: user.id,
    });

    // Calculate and update progress
    const pageProgress = Math.floor((page / totalPages) * 100);
    await updateJobSearch({
      jobSearchId,
      progress: pageProgress,
      userId: user.id,
    });

    // Calculate adjusted progress for UI (more weight to initial progress)
    // Update nextPageToken from the response if not using cache
    if (!useCache && data) {
      nextPageToken = data.serpapi_pagination?.next_page_token;
    }
    
    // Calculate adjusted progress for UI display (more weight to initial progress)
    const adjustedProgress = Math.floor((page / totalPages) * 90) + 10;

    updateJobSearch({
      jobSearchId,
      nextPageToken,
      progress: adjustedProgress,
      userId: user.id,
    });

    sendDataUpdate({
      channel: userChannel,
      payload: {
        data: {
          id: jobSearchId,
          jobListingsCount: totalJobListings,
          progress: adjustedProgress,
          searchTerm,
          status: JobSearchStatus.PROCESSING,
        },
        type: DataEventType.JOB_SEARCH_PROGRESS,
      },
    });

    if (!nextPageToken) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, pageDelay));
  }

  // Finalize the job search record
  const finalJobSearch = await db.jobSearch.update({
    data: {
      completedAt: new Date(),
      endedAt: new Date(),
      progress: 100,
      status: JobSearchStatus.COMPLETED,
    },
    include: {
      _count: {
        select: {
          jobListings: true,
        },
      },
    },
    where: {
      id: jobSearchId,
    },
  });

  revalidateTag(`user:${user.id}:report:job-searches`);
  revalidateTag(`user:${user.id}:job-searches`);
  revalidateTag(`user:${user.id}:job-searches:queue`);
  revalidateTag(`user:${user.id}:job-searches:count`);
  revalidateTag(`user:${user.id}:job-listings`);
  revalidateTag(`user:${user.id}:job-listings:count`);

  // await new Promise(resolve => setTimeout(resolve, 2500));
  // await new Promise(resolve => setTimeout(resolve, 2500));

  // Update final job search status through direct revalidation
  revalidateTag(`job-search-complete:${jobSearchId}`);
  
  /*
  // Legacy notification code - removed to fix TypeScript errors
  // sendNotification({
    channel: userChannel,
    payload: {
      // actionText: 'View results',
      // actionUrl: `/job-search/${jobSearchId}`,
      id: 'job-search-complete',
      message: `Found ${totalJobListings} jobs matching your search.`,
      title: 'Job search complete',
      type: 'success',
    },
    userId: user.id,
  });
  */
  sendDataUpdate({
    channel: userChannel,
    payload: {
      data: {
        id: jobSearchId,
        jobListingsCount: finalJobSearch._count.jobListings,
        progress: 100,
        searchTerm,
        status: JobSearchStatus.COMPLETED,
      },
      type: DataEventType.JOB_SEARCH_PROGRESS,
    },
  });
}
