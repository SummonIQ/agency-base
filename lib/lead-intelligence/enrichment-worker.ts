/**
 * Lead Enrichment Background Worker
 * Processes queued lead enrichments periodically
 * Can be triggered by cron job or external service
 */

import { processEnrichmentQueue, retryFailedEnrichments, getEnrichmentQueueStatus } from './enrichment-pipeline';

/**
 * Main worker function to process lead enrichment queue
 * Should be called periodically (e.g., every 2-5 minutes) by a cron job
 */
export async function runEnrichmentWorker(options: {
  batchSize?: number;
  enableRetries?: boolean;
  maxRetries?: number;
} = {}) {
  const { batchSize = 10, enableRetries = true, maxRetries = 3 } = options;

  try {
    console.log('[Enrichment Worker] Starting lead enrichment processing...');

    // Get current queue status
    const status = await getEnrichmentQueueStatus();
    console.log('[Enrichment Worker] Queue status:', status);

    // Process main queue
    if (status.queued > 0) {
      console.log(`[Enrichment Worker] Processing ${Math.min(batchSize, status.queued)} queued items`);
      const result = await processEnrichmentQueue(batchSize);
      console.log(`[Enrichment Worker] Processed: ${result.processed}, Succeeded: ${result.succeeded}, Failed: ${result.failed}`);
    } else {
      console.log('[Enrichment Worker] No items in queue to process');
    }

    // Retry failed items if enabled
    if (enableRetries && status.failed > 0) {
      console.log(`[Enrichment Worker] Retrying failed enrichments (max retries: ${maxRetries})`);
      const retriedCount = await retryFailedEnrichments(maxRetries);
      console.log(`[Enrichment Worker] Queued ${retriedCount} items for retry`);
    }

    console.log('[Enrichment Worker] Completed lead enrichment processing');

    return {
      success: true,
      queueStatus: status,
    };
  } catch (error) {
    console.error('[Enrichment Worker] Error processing lead enrichment queue:', error);
    // In production, this should report to error tracking service
    throw error;
  }
}

/**
 * Continuous worker that runs in a loop with delays
 * Useful for local development or containerized environments
 */
export async function runContinuousEnrichmentWorker(options: {
  intervalMinutes?: number;
  batchSize?: number;
  enableRetries?: boolean;
  maxRetries?: number;
  maxIterations?: number; // For testing, limit iterations
} = {}) {
  const {
    intervalMinutes = 3,
    batchSize = 10,
    enableRetries = true,
    maxRetries = 3,
    maxIterations
  } = options;

  console.log(`[Continuous Enrichment Worker] Starting with ${intervalMinutes}min intervals`);

  let iteration = 0;

  while (true) {
    try {
      iteration++;
      console.log(`[Continuous Enrichment Worker] Iteration ${iteration}`);

      await runEnrichmentWorker({ batchSize, enableRetries, maxRetries });

      // Check if we should stop (for testing)
      if (maxIterations && iteration >= maxIterations) {
        console.log(`[Continuous Enrichment Worker] Reached max iterations (${maxIterations}), stopping`);
        break;
      }

      // Wait for next interval
      const delayMs = intervalMinutes * 60 * 1000;
      console.log(`[Continuous Enrichment Worker] Waiting ${intervalMinutes} minutes until next run...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));

    } catch (error) {
      console.error('[Continuous Enrichment Worker] Error in worker iteration:', error);

      // Wait a shorter time before retrying on error
      const errorDelayMs = Math.min(intervalMinutes, 2) * 60 * 1000;
      console.log(`[Continuous Enrichment Worker] Waiting ${errorDelayMs/1000}s before retry due to error...`);
      await new Promise(resolve => setTimeout(resolve, errorDelayMs));
    }
  }
}

/**
 * Cleanup function to handle old completed/failed queue items
 * Should be run periodically (e.g., daily) to prevent database bloat
 */
export async function cleanupEnrichmentQueue(options: {
  maxAge?: number; // days
  keepFailedItems?: boolean;
} = {}) {
  const { maxAge = 7, keepFailedItems = true } = options;

  try {
    console.log(`[Enrichment Cleanup] Starting cleanup of queue items older than ${maxAge} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    // Import db here to avoid circular imports
    const { db } = await import('@/lib/db');

    // Delete old completed items
    const deletedCompleted = await db.leadIntelligenceEnrichmentQueue.deleteMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`[Enrichment Cleanup] Deleted ${deletedCompleted.count} old completed items`);

    // Optionally delete old failed items
    let deletedFailed = { count: 0 };
    if (!keepFailedItems) {
      deletedFailed = await db.leadIntelligenceEnrichmentQueue.deleteMany({
        where: {
          status: 'FAILED',
          updatedAt: {
            lt: cutoffDate
          }
        }
      });
      console.log(`[Enrichment Cleanup] Deleted ${deletedFailed.count} old failed items`);
    }

    console.log(`[Enrichment Cleanup] Cleanup completed: ${deletedCompleted.count + deletedFailed.count} total items removed`);

    return {
      deletedCompleted: deletedCompleted.count,
      deletedFailed: deletedFailed.count,
    };
  } catch (error) {
    console.error('[Enrichment Cleanup] Error during cleanup:', error);
    throw error;
  }
}

// For development/testing - can be run directly with different modes
if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args[0] || 'single';

  if (mode === 'single') {
    // Run once and exit
    runEnrichmentWorker()
      .then((result) => {
        console.log('Worker completed successfully:', result);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Worker failed:', error);
        process.exit(1);
      });
  } else if (mode === 'continuous') {
    // Run continuously (useful for development)
    const maxIterations = args[1] ? parseInt(args[1], 10) : undefined;
    runContinuousEnrichmentWorker({ maxIterations })
      .then(() => {
        console.log('Continuous worker completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Continuous worker failed:', error);
        process.exit(1);
      });
  } else if (mode === 'cleanup') {
    // Run cleanup
    cleanupEnrichmentQueue()
      .then((result) => {
        console.log('Cleanup completed:', result);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Cleanup failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: node enrichment-worker.js [single|continuous|cleanup] [maxIterations]');
    process.exit(1);
  }
}