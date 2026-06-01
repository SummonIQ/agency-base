import { 
  InterviewFeedback, 
  InterviewResponseQuality, 
  InterviewQuestion,
  InterviewResponse
} from './types';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';
import { AppError, ErrorCode } from '@/lib/errors';
import { openai } from '@/lib/ai';
import { nanoid } from 'nanoid';

/**
 * Evaluate an interview response and provide feedback
 */
export async function evaluateInterviewResponse(
  questionId: string, 
  response: string
): Promise<{
  id: string;
  feedback: InterviewFeedback;
  quality: InterviewResponseQuality;
  score: number;
}> {
  const user = await getCurrentUser();
  
  // Fetch the question
  const question = await db.interviewQuestion.findUnique({
    where: {
      id: questionId,
      userId: user.id,
    },
  });
  
  if (!question) {
    throw new AppError({
      code: ErrorCode.NOT_FOUND,
      message: `Interview question with ID ${questionId} not found`,
    });
  }
  
  // Generate AI-based feedback
  const feedback = await generateFeedbackWithAI(question, response);
  
  // Save the response and feedback
  const interviewResponse = await db.interviewResponse.create({
    data: {
      id: nanoid(),
      questionId,
      answer: response,
      feedback: feedback.analysis,
      score: feedback.overallScore,
      quality: determineQualityFromScore(feedback.overallScore),
      userId: user.id,
    },
  });
  
  return {
    id: interviewResponse.id,
    feedback,
    quality: determineQualityFromScore(feedback.overallScore),
    score: feedback.overallScore,
  };
}

/**
 * Generate feedback for an interview response using AI
 */
async function generateFeedbackWithAI(
  question: any,
  response: string
): Promise<InterviewFeedback> {
  const prompt = createFeedbackPrompt(question, response);
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach with experience in helping candidates prepare for technical and non-technical interviews. Provide constructive, detailed, and actionable feedback.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    
    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Empty response from AI');
    }
    
    const parsedResponse = JSON.parse(responseContent);
    
    // Validate the response structure
    if (!parsedResponse.strengths || !parsedResponse.weaknesses || !parsedResponse.suggestions || !parsedResponse.overallScore) {
      throw new Error('Invalid response format from AI');
    }
    
    return {
      strengths: parsedResponse.strengths,
      weaknesses: parsedResponse.weaknesses,
      suggestions: parsedResponse.suggestions,
      overallScore: parsedResponse.overallScore,
      detailedBreakdown: parsedResponse.detailedBreakdown || {
        clarity: 0,
        relevance: 0,
        depth: 0,
        structure: 0,
        confidence: 0,
      },
      analysis: parsedResponse.analysis || '',
    };
  } catch (error) {
    console.error('Error generating interview feedback:', error);
    throw new AppError({
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'Failed to generate interview feedback',
      cause: error,
    });
  }
}

/**
 * Create a prompt for the AI to generate interview feedback
 */
function createFeedbackPrompt(
  question: any,
  response: string
): string {
  return `I need feedback on the following interview response.
  
Question: ${question.question}
Type: ${question.type}
Difficulty: ${question.difficulty}

Candidate's Response:
${response}

Please evaluate this answer and provide:
1. 3-5 strengths of the response
2. 3-5 weaknesses or areas for improvement
3. 3-5 specific suggestions to make the answer stronger
4. A detailed breakdown scoring the following aspects on a scale of 1-10:
   - clarity: How clear and concise was the response?
   - relevance: How well did the response address the question?
   - depth: How thorough and in-depth was the answer?
   - structure: How well-organized was the response?
   - confidence: How confident did the candidate appear in their answer?
5. An overall score from 1-100, where 100 is perfect
6. A brief analysis (2-3 paragraphs) of the response with specific feedback

Return the results in this JSON format:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "detailedBreakdown": {
    "clarity": number,
    "relevance": number,
    "depth": number,
    "structure": number,
    "confidence": number
  },
  "overallScore": number,
  "analysis": "detailed analysis text"
}`;
}

/**
 * Determine response quality based on score
 */
function determineQualityFromScore(score: number): InterviewResponseQuality {
  if (score >= 85) return InterviewResponseQuality.EXCELLENT;
  if (score >= 70) return InterviewResponseQuality.GOOD;
  if (score >= 50) return InterviewResponseQuality.FAIR;
  return InterviewResponseQuality.POOR;
}

/**
 * Submit a response to an interview question
 */
export async function submitInterviewResponse(
  questionId: string,
  answer: string,
  sessionId?: string
): Promise<InterviewResponse> {
  const user = await getCurrentUser();
  
  // Evaluate the response
  const evaluation = await evaluateInterviewResponse(questionId, answer);
  
  // If sessionId is provided, update the session
  if (sessionId) {
    // Get current session
    const session = await db.interviewSession.findUnique({
      where: {
        id: sessionId,
        userId: user.id,
      },
      include: {
        responses: true,
      },
    });
    
    if (!session) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: `Interview session with ID ${sessionId} not found`,
      });
    }
    
    // If all questions have been answered, mark the session as completed
    const questions = await db.interviewQuestion.findMany({
      where: {
        interviewSessions: {
          some: {
            id: sessionId,
          },
        },
      },
    });
    
    const responseCount = session.responses.length + 1; // Including the current one
    
    if (responseCount >= questions.length) {
      await db.interviewSession.update({
        where: {
          id: sessionId,
        },
        data: {
          status: 'COMPLETED',
        },
      });
    }
    
    // Update session with response
    await db.interviewSession.update({
      where: {
        id: sessionId,
      },
      data: {
        responses: {
          connect: {
            id: evaluation.id,
          },
        },
      },
    });
  }
  
  // Return the response with feedback
  return {
    id: evaluation.id,
    questionId,
    answer,
    feedback: evaluation.feedback.analysis,
    score: evaluation.feedback.overallScore,
    quality: evaluation.quality,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: user.id,
  };
}

/**
 * Get a summary of an interview session
 */
export async function getInterviewSessionSummary(
  sessionId: string
): Promise<{
  session: any;
  questions: any[];
  responses: any[];
  averageScore: number;
  feedbackSummary: string;
}> {
  const user = await getCurrentUser();
  
  const session = await db.interviewSession.findUnique({
    where: {
      id: sessionId,
      userId: user.id,
    },
    include: {
      questions: true,
      responses: true,
      jobLead: {
        include: {
          jobListing: true,
        },
      },
    },
  });
  
  if (!session) {
    throw new AppError({
      code: ErrorCode.NOT_FOUND,
      message: `Interview session with ID ${sessionId} not found`,
    });
  }
  
  // Calculate average score
  const totalScore = session.responses.reduce((sum, r) => sum + (r.score || 0), 0);
  const averageScore = session.responses.length > 0 
    ? totalScore / session.responses.length 
    : 0;
  
  // Generate a summary of feedback using AI
  let feedbackSummary = '';
  
  if (session.responses.length > 0) {
    feedbackSummary = await generateSessionSummary(session);
  }
  
  return {
    session,
    questions: session.questions,
    responses: session.responses,
    averageScore,
    feedbackSummary,
  };
}

/**
 * Generate a summary of an interview session using AI
 */
async function generateSessionSummary(
  session: any
): Promise<string> {
  const prompt = `I need a summary of this interview practice session.
  
Job Position: ${session.jobLead?.jobListing?.title || 'Not specified'}
Number of Questions: ${session.questions.length}
Number of Responses: ${session.responses.length}
Average Score: ${session.responses.reduce((sum, r) => sum + (r.score || 0), 0) / session.responses.length}

Questions and Answers:
${session.questions.map((q, i) => {
  const response = session.responses.find(r => r.questionId === q.id);
  return `
Q${i + 1}: ${q.question}
${response ? `A${i + 1}: ${response.answer}
Feedback: ${response.feedback || 'No feedback provided'}
Score: ${response.score || 'Not scored'}` : 'Not answered'}
`;
}).join('\n')}

Please provide:
1. A summary of the overall performance
2. Key strengths demonstrated
3. Key areas for improvement
4. Specific advice for future interviews
5. Whether the candidate seems prepared for a real interview

Return this as a well-formatted assessment in 3-4 paragraphs.`;
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach reviewing a practice session. Provide constructive, insightful, and actionable feedback.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
    });
    
    return completion.choices[0]?.message?.content || 'Unable to generate session summary.';
  } catch (error) {
    console.error('Error generating session summary:', error);
    return 'Unable to generate session summary due to an error.';
  }
}
