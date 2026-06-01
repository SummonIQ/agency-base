/**
 * Background worker for processing scheduled applications
 * This can be triggered by a cron job or external service
 */

import { processScheduledApplications } from './scheduling';

/**
 * Main worker function to process scheduled applications
 * Should be called periodically (e.g., every minute) by a cron job
 */
export async function runSchedulerWorker() {
  try {
    console.log('[Scheduler Worker] Starting scheduled application processing...');
    
    await processScheduledApplications();
    
    console.log('[Scheduler Worker] Completed processing scheduled applications');
  } catch (error) {
    console.error('[Scheduler Worker] Error processing scheduled applications:', error);
    // In production, this should report to error tracking service
    throw error;
  }
}

// For development/testing - can be run directly
if (require.main === module) {
  runSchedulerWorker()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Worker failed:', error);
      process.exit(1);
    });
}