import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get user's automation settings
    const settings = await db.automationSettings.findUnique({
      where: { userId: session.user.id },
    });

    // If user approval is not required, return empty array
    if (!settings?.requireUserApproval) {
      return Response.json([]);
    }

    // Get pending applications awaiting approval
    const pendingApplications = await db.applicationSubmission.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        wasAutomated: true,
        metadata: {
          path: ['awaitingApproval'],
          equals: true,
        },
      },
      include: {
        jobLead: true,
        resume: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedApplications = pendingApplications.map(app => ({
      id: app.id,
      jobLeadId: app.jobLeadId,
      jobTitle: app.jobLead.title,
      companyName: app.jobLead.companyName,
      location: app.jobLead.location,
      salaryMin: app.jobLead.salaryMin,
      salaryMax: app.jobLead.salaryMax,
      url: app.jobLead.url,
      description: app.jobLead.description,
      createdAt: app.createdAt,
      resumeId: app.resumeId,
      resumeName: app.resume?.name,
    }));

    return Response.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}