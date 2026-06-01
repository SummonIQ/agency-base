import { openai } from "@ai-sdk/openai";
import { generateText, generateObject, streamText, LanguageModelV1 } from "ai";
import { z } from "zod";
import { AppError, ErrorCode, createAIServiceError, logError } from "./errors";

// Configuration for retry logic
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'rate_limit_exceeded',
    'timeout',
    'connection_error',
    'service_unavailable',
  ],
};

// Circuit breaker configuration
interface CircuitBreakerState {
  failures: number;
  lastFailure: Date | null;
  state: 'closed' | 'open' | 'half-open';
}

const circuitBreakerStates = new Map<string, CircuitBreakerState>();

const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  halfOpenRequests: 3,
};

// Helper to check if error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return RETRY_CONFIG.retryableErrors.some(retryableError => 
      message.includes(retryableError)
    );
  }
  return false;
}

// Sleep helper for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Circuit breaker helper
function getCircuitBreakerState(service: string): CircuitBreakerState {
  if (!circuitBreakerStates.has(service)) {
    circuitBreakerStates.set(service, {
      failures: 0,
      lastFailure: null,
      state: 'closed',
    });
  }
  return circuitBreakerStates.get(service)!;
}

function updateCircuitBreaker(service: string, success: boolean) {
  const state = getCircuitBreakerState(service);
  
  if (success) {
    // Reset on success
    state.failures = 0;
    state.state = 'closed';
  } else {
    // Increment failures
    state.failures++;
    state.lastFailure = new Date();
    
    // Open circuit if threshold reached
    if (state.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      state.state = 'open';
    }
  }
}

function canMakeRequest(service: string): boolean {
  const state = getCircuitBreakerState(service);
  
  if (state.state === 'closed') {
    return true;
  }
  
  if (state.state === 'open' && state.lastFailure) {
    const timeSinceFailure = Date.now() - state.lastFailure.getTime();
    if (timeSinceFailure > CIRCUIT_BREAKER_CONFIG.resetTimeout) {
      state.state = 'half-open';
      return true;
    }
  }
  
  return state.state === 'half-open';
}

// Retry wrapper for AI operations
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>
): Promise<T> {
  let lastError: unknown;
  let delay = RETRY_CONFIG.initialDelay;
  
  // Check circuit breaker
  if (!canMakeRequest('openai')) {
    throw new AppError({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: 'AI service is temporarily unavailable due to repeated failures',
      userMessage: 'AI service is temporarily unavailable. Please try again in a few minutes.',
      retryable: true,
      context: { ...context, circuitBreaker: true },
    });
  }
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const result = await operation();
      updateCircuitBreaker('openai', true);
      return result;
    } catch (error) {
      lastError = error;
      
      logError(error instanceof Error ? error : new Error(String(error)), {
        ...context,
        attempt,
        operationName,
      });
      
      // Don't retry if it's not a retryable error or we've exhausted retries
      if (!isRetryableError(error) || attempt === RETRY_CONFIG.maxRetries) {
        updateCircuitBreaker('openai', false);
        break;
      }
      
      // Wait before retrying with exponential backoff
      await sleep(Math.min(delay, RETRY_CONFIG.maxDelay));
      delay *= RETRY_CONFIG.backoffMultiplier;
    }
  }
  
  // All retries failed
  throw createAIServiceError(lastError, {
    ...context,
    operationName,
    retriesExhausted: true,
  });
}

// Export AI instance
export const ai = openai("gpt-4o-mini");

// Enhanced AI text generation with retry
export async function generateAIText(
  prompt: string, 
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
): Promise<string> {
  return withRetry(
    async () => {
      const result = await generateText({
        model: options?.model ? openai(options.model) : ai,
        prompt,
        maxTokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        abortSignal: AbortSignal.timeout(30000), // 30 second timeout
      });
      return result.text;
    },
    'generateAIText',
    { prompt: prompt.slice(0, 100), options }
  );
}

// Enhanced AI object generation with retry
export async function generateAIObject<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
): Promise<T> {
  return withRetry(
    async () => {
      const result = await generateObject({
        model: options?.model ? openai(options.model) : ai,
        prompt,
        schema,
        maxTokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        abortSignal: AbortSignal.timeout(30000), // 30 second timeout
      });
      return result.object;
    },
    'generateAIObject',
    { prompt: prompt.slice(0, 100), options }
  );
}

// Enhanced AI streaming with retry
export async function streamAIText(
  prompt: string, 
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
) {
  // Note: Streaming doesn't support full retry logic due to its nature
  // But we can at least check circuit breaker
  if (!canMakeRequest('openai')) {
    throw new AppError({
      code: ErrorCode.SERVICE_UNAVAILABLE,
      message: 'AI service is temporarily unavailable',
      userMessage: 'AI service is temporarily unavailable. Please try again in a few minutes.',
      retryable: true,
    });
  }
  
  try {
    const result = await streamText({
      model: options?.model ? openai(options.model) : ai,
      prompt,
      maxTokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      abortSignal: AbortSignal.timeout(60000), // 60 second timeout for streams
    });
    updateCircuitBreaker('openai', true);
    return result;
  } catch (error) {
    updateCircuitBreaker('openai', false);
    throw createAIServiceError(error, { 
      prompt: prompt.slice(0, 100), 
      options,
      streaming: true 
    });
  }
}

// Fallback response generators for when AI is unavailable
export const fallbackResponses = {
  generateDefaultSkillsAnalysis: () => ({
    skills: [],
    recommendations: [
      "Unable to analyze skills at this time. Please try again later.",
      "Consider manually reviewing the job requirements against your resume.",
    ],
  }),
  
  generateDefaultJobAnalysis: () => ({
    fitScore: 0,
    strengths: ["Analysis unavailable"],
    gaps: ["Analysis unavailable"],
    recommendations: [
      "AI analysis is temporarily unavailable.",
      "Please try again in a few minutes or proceed with manual review.",
    ],
  }),
  
  generateDefaultInterviewQuestions: () => ({
    questions: [
      {
        question: "Tell me about yourself and your background.",
        type: "general" as const,
        difficulty: "easy" as const,
        tips: ["Keep it concise and relevant to the role"],
      },
      {
        question: "Why are you interested in this position?",
        type: "general" as const,
        difficulty: "easy" as const,
        tips: ["Show enthusiasm and knowledge about the company"],
      },
      {
        question: "What are your greatest strengths?",
        type: "behavioral" as const,
        difficulty: "medium" as const,
        tips: ["Provide specific examples"],
      },
    ],
  }),
};

// Export schemas from original file
export { commonSchemas } from './ai';