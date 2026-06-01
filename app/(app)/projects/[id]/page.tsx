import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ProjectDetailClient } from './project-detail-client';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const project = await db.project.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      client: true,
      tasks: {
        include: {
          assignee: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      timeEntries: {
        include: {
          user: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
      milestones: {
        orderBy: {
          dueDate: 'asc',
        },
      },
      deliverables: {
        orderBy: {
          dueDate: 'asc',
        },
      },
      contract: true,
    },
  });

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}