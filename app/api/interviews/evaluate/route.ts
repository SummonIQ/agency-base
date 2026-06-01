import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiErrorHandling, requireAuth } from '@/lib/errors/api';
import { evaluateInterviewResponse } from '@/lib/interviews/evaluate';

const evaluateResponseSchema = z.object({
  questionId: z.string(),
  response: z.string().min(1),
  sessionId: z.string().optional(),
});

const handlePOST = async (request: NextRequest): Promise<NextResponse> => {
  const user = requireAuth(await request.json());
  const body = await request.json();
  
  const evaluation = await evaluateInterviewResponse(body.questionId, body.response);
  
  return NextResponse.json({
    success: true,
    data: evaluation
  });
};

export const POST = withApiErrorHandling(handlePOST);
