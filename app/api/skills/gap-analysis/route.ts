import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withApiErrorHandling, requireAuth } from '@/lib/errors/api';
import { analyzeSkillGap, getSkillGapAnalysis, getAllSkillGapAnalyses } from '@/lib/skills/gap-analysis';

const analyzeSkillGapSchema = z.object({
  jobLeadId: z.string().optional(),
  resumeId: z.string().optional(),
  jobTitle: z.string().optional(),
  jobDescription: z.string().optional(),
  resumeText: z.string().optional(),
});

/**
 * GET handler for fetching skill gap analyses
 */
const handleGET = async (request: NextRequest): Promise<NextResponse> => {
  const user = requireAuth(await request.json());
  
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  let data;
  if (id) {
    data = await getSkillGapAnalysis(id);
  } else {
    data = await getAllSkillGapAnalyses();
  }
  
  return NextResponse.json({ success: true, data });
};

/**
 * POST handler for creating a new skill gap analysis
 */
const handlePOST = async (request: NextRequest): Promise<NextResponse> => {
  const user = requireAuth(await request.json());
  const body = await request.json();
  
  const analysis = await analyzeSkillGap(body);
  
  return NextResponse.json({
    success: true,
    data: analysis,
  });
};

export const GET = withApiErrorHandling(handleGET);
export const POST = withApiErrorHandling(handlePOST);
