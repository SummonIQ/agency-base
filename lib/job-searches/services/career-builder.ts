import { JobBoard, type Prisma } from '@prisma/client';
import * as cheerio from 'cheerio';
import { after } from 'next/server';
import puppeteer from 'puppeteer-extra';
import UserAgent from 'user-agents';

import { db } from '@/lib/db';
import { AppError, ErrorCode, createJobSearchError } from '@/lib/errors';
// export const dynamic = 'force-static';

// puppeteer.use(StealthPlugin());

export async function scrapeExtendedJobDetails({ url }: { url: string }) {
  // Input validation
  if (!url || typeof url !== 'string') {
    throw new AppError({
      code: ErrorCode.INVALID_INPUT,
      message: 'Valid URL is required for job scraping',
      userMessage: 'Please provide a valid job URL.',
    });
  }

  let browser;
  try {
    // Validate URL format
    new URL(url);
  } catch {
    throw new AppError({
      code: ErrorCode.INVALID_INPUT,
      message: `Invalid URL format: ${url}`,
      userMessage: 'The job URL format is invalid.',
    });
  }

  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: false, // Disable headless mode to better mimic a real browser
    });
  } catch (error) {
    throw createJobSearchError(error, {
      operation: 'puppeteer.launch',
      url,
    });
  }

  after(async () => {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.warn('Error closing browser:', error);
      }
    }
  });

  try {
    const page = await browser.newPage();
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    const randomUserAgent = userAgent.toString();

    await page.setUserAgent(randomUserAgent);
    await page.emulateTimezone('America/Denver');

    // Navigate to the job page with timeout
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 // 30 second timeout
    });

    if (!response || !response.ok()) {
      throw new AppError({
        code: ErrorCode.JOB_SEARCH_ERROR,
        message: `Failed to load job page. Status: ${response?.status()}`,
        userMessage: 'Unable to access the job listing. The page may be unavailable.',
        context: { url, status: response?.status() },
        retryable: true,
      });
    }

    // Wait for the job title to load or timeout after 60 seconds
    let hasJobContent = false;
    try {
      await page.waitForSelector('h1.job-title', { timeout: 60000 });
      hasJobContent = true;
    } catch (e: unknown) {
      // Try alternative selectors
      try {
        await page.waitForSelector('h1', { timeout: 10000 });
        hasJobContent = true;
      } catch {
        console.warn('Job title not found, potential Cloudflare challenge or different page structure.', e);
      }
    }

    if (!hasJobContent) {
      throw new AppError({
        code: ErrorCode.JOB_SEARCH_ERROR,
        message: 'Job content not found on page',
        userMessage: 'Unable to extract job information. The page structure may have changed.',
        context: { url },
        retryable: true,
      });
    }

    // Extract page content
    const html = await page.content();
    const $ = cheerio.load(html);

    // Parse job details (customize selectors as needed)
    const title = $('h1.job-title').text().trim() || $('h1').first().text().trim();
    const company = $('div.company-info span.company-name').text().trim() || $('[data-testid="company-name"]').text().trim();
    const location = $('div.location').text().trim() || $('[data-testid="job-location"]').text().trim();
    const description = $('div.job-description').text().trim() || $('[data-testid="job-description"]').text().trim();

    // Validate that we extracted meaningful data
    if (!title && !company && !description) {
      throw new AppError({
        code: ErrorCode.JOB_SEARCH_ERROR,
        message: 'No job data could be extracted from page',
        userMessage: 'Unable to extract job information. The page may have changed or be protected.',
        context: { url, htmlLength: html.length },
        retryable: true,
      });
    }

    return { 
      company: company || 'Not specified', 
      description: description || 'No description available', 
      location: location || 'Not specified', 
      title: title || 'Job Title Not Found'
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    throw createJobSearchError(error, {
      operation: 'scrapeExtendedJobDetails',
      url,
      step: 'page_scraping',
    });
  }
}

export async function scrapeCareerBuilderListings({
  endPage = 1,
  location,
  startPage = 1,
  pageDelay = 5000,
  jobSearchId,
  remote = false,
  searchTerm,
}: {
  endPage?: number;
  jobSearchId: string;
  location?: string;
  pageDelay?: number;
  remote?: boolean;
  searchTerm: string;
  startPage?: number;
}): Promise<Array<Record<string, unknown>>> {
  const browser = await puppeteer.launch();
  const jobListings: Array<Record<string, unknown>> = [];

  for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
    const page = await browser.newPage();
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    const randomUserAgent = userAgent.toString();

    await page.setUserAgent(randomUserAgent);
    await page.emulateTimezone('America/Denver');

    const url = `https://www.careerbuilder.com/jobs?posted=&radius=30&page_number=${pageNumber}&cb_apply=false&keywords=${searchTerm}&location=${location}&pay=&emp=&cb_veterans=false&cb_workhome=${remote ? 'remote' : 'all'}&sort=date_desc`;

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const html = await page.content(); // Get the fully rendered HTML
    const $ = cheerio.load(html);

    $('.data-results .data-results-content-parent').each((_, element) => {
      const title = $(element).find('.data-results-title').text().trim();
      const company = $(element)
        .find('.data-details span:nth-child(1)')
        .text()
        .trim();
      const location = $(element)
        .find('.data-details span:nth-child(2)')
        .text()
        .trim();
      const description = $(element).find('.data-snapshot div').text().trim();
      const jobBoardUrl = $(element).find('a').attr('href');

      jobListings.push({
        applyOptions: [],
        company,
        description: description || 'No description provided',
        jobBoard: JobBoard.CAREER_BUILDER,
        jobBoardUrl: jobBoardUrl
          ? `https://www.careerbuilder.com${jobBoardUrl}`
          : undefined,
        jobSearchId,
        location,
        title,
      });
    });

    await db.jobSearch.update({
      data: {
        completedPages: pageNumber,
      },
      where: {
        id: jobSearchId,
      },
    });

    await new Promise(resolve => setTimeout(resolve, pageDelay));
  }

  await browser.close();

  await db.jobListing.createManyAndReturn({
    data: jobListings as Array<Prisma.JobListingCreateManyInput>,
    skipDuplicates: true,
  });

  await db.jobSearch.update({
    data: {
      completedAt: new Date(),
      endedAt: new Date(),
    },
    include: {
      jobListings: true,
    },
    where: {
      id: jobSearchId,
    },
  });

  return jobListings;
}
