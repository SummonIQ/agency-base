"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/user";
import { JobBoard } from "@prisma/client";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Configuration for scraping
const SCRAPER_CONFIG = {
  timeout: 30000,
  navigationTimeout: 60000,
  waitTime: 5000, // Time to wait for dynamic content to load
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
  pageSize: 25,
};

// Job board configurations
const JOB_BOARD_CONFIGS = {
  [JobBoard.GLASSDOOR]: {
    searchUrlTemplate: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword={searchTerm}&locT=C&locId={locationId}',
    jobItemSelector: '.react-job-listing',
    titleSelector: '.job-title',
    companySelector: '.employer-name',
    locationSelector: '.location',
    descriptionSelector: '.jobDescriptionContent',
    extractId: (element: Element) => element.getAttribute('data-id') || '',
    baseUrl: 'https://www.glassdoor.com',
    jobUrlTemplate: 'https://www.glassdoor.com/job-listing/{jobId}',
  },
  [JobBoard.MONSTER]: {
    searchUrlTemplate: 'https://www.monster.com/jobs/search?q={searchTerm}&where={location}',
    jobItemSelector: '.job-cardstyle__JobCardComponent-sc-1mbmxyd-0',
    titleSelector: '.job-cardstyle__JobCardTitle-sc-1mbmxyd-2',
    companySelector: '.job-cardstyle__CompanyName-sc-1mbmxyd-3',
    locationSelector: '.job-cardstyle__LocationWithCommuteOption-sc-1mbmxyd-4',
    descriptionSelector: '.detail-page-content',
    extractId: (element: Element) => element.getAttribute('data-job-id') || '',
    baseUrl: 'https://www.monster.com',
    jobUrlTemplate: 'https://www.monster.com/job-openings/{jobId}',
  },
  // Add more job boards as needed
};

/**
 * Universal job board scraper that works with multiple job sites
 * This is a fallback for sites that don't offer API access
 */
export async function scrapeJobBoard({
  jobSearchId,
  searchTerm,
  location,
  jobBoard,
  pages = 1,
}: {
  jobSearchId: string;
  searchTerm: string;
  location?: string;
  jobBoard: JobBoard;
  pages?: number;
}) {
  // Only allow scraping for supported job boards
  if (!Object.keys(JOB_BOARD_CONFIGS).includes(jobBoard)) {
    throw new Error(`Job board ${jobBoard} is not supported for scraping`);
  }

  const user = await getCurrentUser();
  if (!user) throw new Error("User not found");

  // Update job search status to processing
  await db.jobSearch.update({
    where: { id: jobSearchId },
    data: { status: "PROCESSING", progress: 10 },
  });

  const config = JOB_BOARD_CONFIGS[jobBoard as keyof typeof JOB_BOARD_CONFIGS];
  let browser;
  let totalJobListings = 0;

  try {
    // Launch browser with stealth plugin
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(SCRAPER_CONFIG.timeout);
    page.setDefaultNavigationTimeout(SCRAPER_CONFIG.navigationTimeout);
    
    // Set user agent to avoid detection
    await page.setUserAgent(SCRAPER_CONFIG.userAgent);

    // Build the search URL
    let searchUrl = config.searchUrlTemplate
      .replace('{searchTerm}', encodeURIComponent(searchTerm));
    
    if (location) {
      searchUrl = searchUrl.replace('{location}', encodeURIComponent(location));
    }

    // Scrape each page of results
    for (let pageNum = 1; pageNum <= pages; pageNum++) {
      const pageUrl = pageNum === 1 ? searchUrl : `${searchUrl}&page=${pageNum}`;
      
      // Navigate to the search URL
      await page.goto(pageUrl, { waitUntil: 'networkidle2' });
      
      // Wait for job listings to load
      await page.waitForSelector(config.jobItemSelector, { timeout: SCRAPER_CONFIG.timeout });
      
      // Wait a bit to ensure dynamic content loads
      await page.waitForTimeout(SCRAPER_CONFIG.waitTime);

      // Update progress
      await db.jobSearch.update({
        where: { id: jobSearchId },
        data: { progress: 10 + Math.floor((pageNum / pages) * 80) },
      });

      // Extract job listings
      const jobListings = await page.evaluate((config) => {
        const items = document.querySelectorAll(config.jobItemSelector);
        
        return Array.from(items).map((item) => {
          // Get job URL either from href attribute or by constructing it
          const linkElement = item.querySelector('a');
          const jobUrl = linkElement?.href || '';
          
          // Extract job ID using the board-specific method
          const jobId = config.extractId(item);
          
          // Get title, company, location
          const title = item.querySelector(config.titleSelector)?.textContent?.trim() || '';
          const company = item.querySelector(config.companySelector)?.textContent?.trim() || '';
          const location = item.querySelector(config.locationSelector)?.textContent?.trim() || '';
          
          return {
            title,
            company,
            location,
            url: jobUrl || `${config.jobUrlTemplate.replace('{jobId}', jobId)}`,
            jobId,
          };
        });
      }, config);

      // Get additional details for each job if needed
      const jobListingsWithDetails = [];
      
      for (const job of jobListings) {
        // Only proceed with valid jobs
        if (!job.title || !job.company) continue;
        
        jobListingsWithDetails.push({
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          description: '', // We could load individual job pages to get descriptions, but that would be slow
          jobBoard,
          jobSearchId,
          userId: user.id,
          jobId: job.jobId,
        });
      }

      // Save job listings to database
      if (jobListingsWithDetails.length > 0) {
        await db.jobListing.createMany({
          data: jobListingsWithDetails,
          skipDuplicates: true,
        });
        
        totalJobListings += jobListingsWithDetails.length;
      }

      // If we've reached the last page or there are no more results, break
      if (pageNum >= pages) {
        break;
      }
      
      // Check if next page button exists
      const hasNextPage = await page.evaluate(() => {
        const nextButtons = Array.from(document.querySelectorAll('a, button')).filter(el => 
          el.textContent?.toLowerCase().includes('next') || 
          el.getAttribute('aria-label')?.toLowerCase().includes('next')
        );
        return nextButtons.length > 0;
      });
      
      if (!hasNextPage) {
        break;
      }
      
      // Rate limiting to be respectful to the job board
      await page.waitForTimeout(2000);
    }

    // Mark job search as completed
    await db.jobSearch.update({
      data: { 
        completedAt: new Date(),
        endedAt: new Date(),
        progress: 100,
        status: "COMPLETED",
        totalJobs: totalJobListings
      },
      where: { id: jobSearchId },
    });

    return totalJobListings;
  } catch (error) {
    console.error(`Error scraping ${jobBoard}:`, error);
    
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
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Determines the best search method (API or scraping) for a given job board
 */
export async function determineSearchMethod(jobBoard: JobBoard): Promise<'api' | 'scraping'> {
  // For LinkedIn and Indeed, check if API credentials exist
  if (jobBoard === JobBoard.LINKEDIN) {
    const hasCredentials = await db.userIntegration.findFirst({
      where: {
        provider: 'LINKEDIN',
      },
    });
    
    return hasCredentials ? 'api' : 'scraping';
  }
  
  if (jobBoard === JobBoard.INDEED) {
    const hasCredentials = await db.userIntegration.findFirst({
      where: {
        provider: 'INDEED',
      },
    });
    
    return hasCredentials ? 'api' : 'scraping';
  }
  
  // For other job boards, always use scraping
  return 'scraping';
}
