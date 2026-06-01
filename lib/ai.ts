import { openai } from "@ai-sdk/openai";
import { generateText, generateObject, streamText } from "ai";
import { z } from "zod";

export const ai = openai("gpt-4o-mini");

export async function generateAIText(prompt: string, options?: {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}) {
  const result = await generateText({
    model: options?.model ? openai(options.model) : ai,
    prompt,
    maxTokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.7,
  });

  return result.text;
}

export async function generateAIObject<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
): Promise<T> {
  const result = await generateObject({
    model: options?.model ? openai(options.model) : ai,
    prompt,
    schema,
    maxTokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.7,
  });

  return result.object;
}

export async function streamAIText(prompt: string, options?: {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}) {
  return streamText({
    model: options?.model ? openai(options.model) : ai,
    prompt,
    maxTokens: options?.maxTokens || 1000,
    temperature: options?.temperature || 0.7,
  });
}

// Common AI prompts and schemas
export const commonSchemas = {
  skillsAnalysis: z.object({
    skills: z.array(z.object({
      name: z.string(),
      level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      category: z.string(),
      relevance: z.number().min(0).max(1),
    })),
    recommendations: z.array(z.string()),
  }),
  
  jobAnalysis: z.object({
    fitScore: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  
  interviewQuestions: z.object({
    questions: z.array(z.object({
      question: z.string(),
      type: z.enum(["behavioral", "technical", "situational", "general"]),
      difficulty: z.enum(["easy", "medium", "hard"]),
      tips: z.array(z.string()),
    })),
  }),
};