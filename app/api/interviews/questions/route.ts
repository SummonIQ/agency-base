import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiErrorHandling, requireAuth } from '@/lib/errors/api';
import { generateInterviewQuestions } from '@/lib/interviews/generate';
import { InterviewType, DifficultyLevel } from '@/lib/interviews/types';

const generateQuestionsSchema = z.object({
  jobLeadId: z.string().optional(),
  type: z.nativeEnum(InterviewType).optional(),
  count: z.number().min(1).max(20).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
  specificTopic: z.string().optional(),
});

const handlePOST = async (request: NextRequest): Promise<NextResponse> => {
  const user = requireAuth(await request.json());
  const body = await request.json();
  
  const questions = await generateInterviewQuestions(body);
  
  return NextResponse.json({ 
    success: true, 
    data: questions 
  });
};

export const POST = withApiErrorHandling(handlePOST);
