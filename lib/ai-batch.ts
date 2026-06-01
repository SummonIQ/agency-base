import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { AppError, ErrorCode, createAIServiceError, logError } from "./errors";
import { ai } from "./ai-with-retry";

// Batch request configuration
interface BatchRequest<T> {
  id: string;
  prompt: string;
  schema: z.ZodSchema<T>;
  resolver: (result: T) => void;
  rejecter: (error: Error) => void;
}

// Batch processor for AI requests
class AIBatchProcessor {
  private batchQueue: Map<string, BatchRequest<any>[]> = new Map();
  private processingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly maxBatchSize = 5;
  private readonly batchDelayMs = 100; // Wait 100ms to collect requests

  // Add a request to the batch queue
  async addRequest<T>(
    batchKey: string,
    prompt: string,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest<T> = {
        id: `${batchKey}-${Date.now()}-${Math.random()}`,
        prompt,
        schema,
        resolver: resolve,
        rejecter: reject,
      };

      // Add to queue
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, []);
      }
      this.batchQueue.get(batchKey)!.push(request);

      // Schedule batch processing
      this.scheduleBatchProcessing(batchKey);
    });
  }

  private scheduleBatchProcessing(batchKey: string) {
    // Clear existing timeout
    if (this.processingTimeouts.has(batchKey)) {
      clearTimeout(this.processingTimeouts.get(batchKey)!);
    }

    // Schedule new processing
    const timeout = setTimeout(() => {
      this.processBatch(batchKey);
    }, this.batchDelayMs);

    this.processingTimeouts.set(batchKey, timeout);

    // Process immediately if batch is full
    const queue = this.batchQueue.get(batchKey) || [];
    if (queue.length >= this.maxBatchSize) {
      clearTimeout(timeout);
      this.processingTimeouts.delete(batchKey);
      this.processBatch(batchKey);
    }
  }

  private async processBatch(batchKey: string) {
    const queue = this.batchQueue.get(batchKey);
    if (!queue || queue.length === 0) return;

    // Take up to maxBatchSize items
    const batch = queue.splice(0, this.maxBatchSize);
    
    // Clean up if queue is empty
    if (queue.length === 0) {
      this.batchQueue.delete(batchKey);
    }

    try {
      // Create a combined prompt for batch processing
      const combinedPrompt = this.createBatchPrompt(batch);
      
      // Process batch request
      const results = await this.executeBatchRequest(combinedPrompt, batch);
      
      // Resolve individual requests
      batch.forEach((request, index) => {
        if (results[index]) {
          request.resolver(results[index]);
        } else {
          request.rejecter(new Error('No result for batch request'));
        }
      });
    } catch (error) {
      // Reject all requests in the batch
      const aiError = createAIServiceError(error, {
        batchKey,
        batchSize: batch.length,
      });
      batch.forEach(request => request.rejecter(aiError));
    }
  }

  private createBatchPrompt(batch: BatchRequest<any>[]): string {
    return `Process the following ${batch.length} requests and return results as a JSON array:

${batch.map((req, index) => `
Request ${index + 1}:
${req.prompt}
`).join('\n')}

Return the results as a JSON array where each element corresponds to the request at the same index.`;
  }

  private async executeBatchRequest(
    combinedPrompt: string,
    batch: BatchRequest<any>[]
  ): Promise<any[]> {
    // Create a schema for the batch response
    const batchSchema = z.object({
      results: z.array(z.any()),
    });

    const { object } = await generateObject({
      model: ai,
      prompt: combinedPrompt,
      schema: batchSchema,
      maxTokens: 2000 * batch.length, // Scale tokens with batch size
      temperature: 0.7,
    });

    // Validate individual results against their schemas
    const validatedResults = [];
    for (let i = 0; i < batch.length; i++) {
      try {
        const validated = batch[i].schema.parse(object.results[i]);
        validatedResults.push(validated);
      } catch (error) {
        logError(error instanceof Error ? error : new Error('Validation failed'), {
          batchIndex: i,
          result: object.results[i],
        });
        validatedResults.push(null);
      }
    }

    return validatedResults;
  }
}

// Singleton instance
const batchProcessor = new AIBatchProcessor();

// Batch-optimized AI functions
export async function batchGenerateJobFitAnalysis(
  analyses: Array<{
    resumeMarkdown: string;
    jobDescription: string;
  }>
): Promise<any[]> {
  const promises = analyses.map((analysis) =>
    batchProcessor.addRequest(
      'job-fit-analysis',
      `Analyze job fit between resume and job description:
Resume: ${analysis.resumeMarkdown}
Job Description: ${analysis.jobDescription}`,
      z.object({
        overallMatchScore: z.number(),
        keywordMatch: z.object({
          matchPercentage: z.number(),
          matchedKeywords: z.array(z.string()),
        }),
        missingKeywords: z.array(z.string()),
        recommendations: z.array(z.string()),
      })
    )
  );

  return Promise.all(promises);
}

export async function batchGenerateResumeOptimizations(
  resumes: Array<{
    resumeContent: string;
    jobDescription?: string;
  }>
): Promise<any[]> {
  const promises = resumes.map((resume) =>
    batchProcessor.addRequest(
      'resume-optimization',
      `Optimize resume for ATS and job requirements:
Resume: ${resume.resumeContent}
${resume.jobDescription ? `Job Description: ${resume.jobDescription}` : ''}`,
      z.object({
        score: z.number(),
        improvements: z.array(z.string()),
        optimizedContent: z.string(),
      })
    )
  );

  return Promise.all(promises);
}

// Cache implementation for AI responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AIResponseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 3600000; // 1 hour

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Export cache instance
export const aiCache = new AIResponseCache();

// Cached AI function wrapper
export async function cachedAIRequest<T>(
  cacheKey: string,
  generator: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = aiCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Generate new response
  const result = await generator();

  // Cache the result
  aiCache.set(cacheKey, result, ttl);

  return result;
}

// Periodic cache cleanup
if (typeof process !== 'undefined') {
  setInterval(() => {
    aiCache.cleanup();
  }, 300000); // Clean up every 5 minutes
}