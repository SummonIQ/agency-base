import { 
  InterviewQuestion, 
  InterviewQuestionGenerationOptions, 
  InterviewType, 
  DifficultyLevel 
} from './types';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/user';
import { AppError, ErrorCode } from '@/lib/errors';
import { openai } from '@/lib/ai';
import { nanoid } from 'nanoid';

/**
 * Generate interview questions based on the provided options
 */
export async function generateInterviewQuestions(
  options: InterviewQuestionGenerationOptions
): Promise<InterviewQuestion[]> {
  const user = await getCurrentUser();
  
  let jobLead;
  let jobTitle = options.jobTitle;
  let jobDescription = options.jobDescription;
  
  // If jobLeadId is provided, fetch the job details
  if (options.jobLeadId) {
    jobLead = await db.jobLead.findUnique({
      where: {
        id: options.jobLeadId,
        userId: user.id,
      },
      include: {
        jobListing: true,
      },
    });
    
    if (!jobLead) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: `Job lead with ID ${options.jobLeadId} not found`,
      });
    }
    
    jobTitle = jobLead.jobListing.title;
    jobDescription = jobLead.jobListing.description || '';
  }
  
  if (!jobTitle && !options.specificTopic) {
    throw new AppError({
      code: ErrorCode.INVALID_INPUT,
      message: 'Either jobLeadId, jobTitle, or specificTopic must be provided',
    });
  }
  
  // Default options
  const count = options.count || 5;
  const type = options.type || InterviewType.MIXED;
  const difficulty = options.difficulty || DifficultyLevel.MEDIUM;
  
  const questions = await generateQuestionsWithAI({
    jobTitle,
    jobDescription,
    type,
    difficulty,
    count,
    specificTopic: options.specificTopic,
  });
  
  // Save questions to database
  const savedQuestions = await Promise.all(
    questions.map(async (question) => {
      return db.interviewQuestion.create({
        data: {
          id: nanoid(),
          type: question.type,
          question: question.question,
          description: question.description,
          difficulty: question.difficulty,
          jobLeadId: options.jobLeadId,
          userId: user.id,
        },
      });
    })
  );
  
  return savedQuestions;
}

/**
 * Use AI to generate interview questions
 */
async function generateQuestionsWithAI({
  jobTitle,
  jobDescription,
  type,
  difficulty,
  count,
  specificTopic,
}: {
  jobTitle?: string;
  jobDescription?: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  count: number;
  specificTopic?: string;
}): Promise<Partial<InterviewQuestion>[]> {
  const prompt = createQuestionGenerationPrompt({
    jobTitle,
    jobDescription,
    type,
    difficulty,
    count,
    specificTopic,
  });
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach who creates realistic and insightful interview questions tailored to specific job roles.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Empty response from AI');
    }
    
    const parsedResponse = JSON.parse(responseContent);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format from AI');
    }
    
    return parsedResponse.questions.map((q: any) => ({
      question: q.question,
      description: q.description || '',
      type: q.type || type,
      difficulty: q.difficulty || difficulty,
    }));
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new AppError({
      code: ErrorCode.AI_SERVICE_ERROR,
      message: 'Failed to generate interview questions',
      cause: error,
    });
  }
}

/**
 * Create a prompt for the AI to generate interview questions
 */
function createQuestionGenerationPrompt({
  jobTitle,
  jobDescription,
  type,
  difficulty,
  count,
  specificTopic,
}: {
  jobTitle?: string;
  jobDescription?: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  count: number;
  specificTopic?: string;
}): string {
  let prompt = `Generate ${count} realistic interview questions`;
  
  if (jobTitle) {
    prompt += ` for a ${jobTitle} position`;
  }
  
  if (specificTopic) {
    prompt += ` focusing on ${specificTopic}`;
  }
  
  if (type !== InterviewType.MIXED) {
    prompt += ` that are ${type.toLowerCase()} in nature`;
  }
  
  prompt += `. The difficulty level should be ${difficulty.toLowerCase()}.`;
  
  if (jobDescription) {
    prompt += `\n\nHere's the job description to reference:\n${jobDescription}`;
  }
  
  prompt += `\n\nReturn the response as a JSON object with an array of questions. Each question should have the following properties:
  - question: The actual interview question
  - description: A brief explanation of why this question is asked and what the interviewer is looking for
  - type: One of the following interview types: ${Object.values(InterviewType).join(', ')}
  - difficulty: One of the following difficulty levels: ${Object.values(DifficultyLevel).join(', ')}
  
  Example format:
  {
    "questions": [
      {
        "question": "Can you describe a challenging project you worked on and how you overcame obstacles?",
        "description": "This question assesses problem-solving abilities and resilience under pressure.",
        "type": "BEHAVIORAL",
        "difficulty": "MEDIUM"
      },
      ...more questions
    ]
  }`;
  
  return prompt;
}

/**
 * Create a new interview session with generated questions
 */
export async function createInterviewSession(options: InterviewQuestionGenerationOptions): Promise<string> {
  const user = await getCurrentUser();
  
  // Generate questions
  const questions = await generateInterviewQuestions(options);
  
  // Create session
  const session = await db.interviewSession.create({
    data: {
      name: `Interview Session - ${new Date().toLocaleDateString()}`,
      questions: {
        connect: questions.map(q => ({ id: q.id })),
      },
      status: 'IN_PROGRESS',
      jobLeadId: options.jobLeadId,
      userId: user.id,
    },
  });
  
  return session.id;
}
