import { db } from '@/lib/db';
import { ServiceType, Prisma } from '@prisma/client';

export async function getPortfolioProjects(
  userId: string,
  includeUnpublished = false
) {
  return db.portfolioProject.findMany({
    where: {
      userId,
      ...(includeUnpublished ? {} : { isPublished: true }),
    },
    orderBy: [
      { isFeatured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getPublicPortfolioProjects() {
  return db.portfolioProject.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      { isFeatured: 'desc' },
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

export async function getPortfolioProject(slug: string, userId?: string) {
  const where: Prisma.PortfolioProjectWhereInput = {
    slug,
  };
  
  // If userId provided, allow unpublished projects for owner
  if (userId) {
    where.OR = [
      { isPublished: true },
      { userId },
    ];
  } else {
    where.isPublished = true;
  }

  return db.portfolioProject.findFirst({
    where,
  });
}

export async function createPortfolioProject(
  userId: string,
  data: {
    title: string;
    slug: string;
    description?: string;
    clientName?: string;
    industry?: string;
    serviceType?: ServiceType;
    duration?: string;
    teamSize?: number;
    budget?: string;
    challenge?: string;
    solution?: string;
    results?: string;
    testimonial?: string;
    testimonialAuthor?: string;
    testimonialRole?: string;
    featuredImage?: string;
    images?: string[];
    videoUrl?: string;
    liveUrl?: string;
    githubUrl?: string;
    technologies?: string[];
    isPublished?: boolean;
    isFeatured?: boolean;
    order?: number;
  }
) {
  const { images, technologies, ...projectData } = data;

  return db.portfolioProject.create({
    data: {
      ...projectData,
      images: images ? images : undefined,
      technologies: technologies || [],
      userId,
    },
  });
}

export async function updatePortfolioProject(
  id: string,
  userId: string,
  data: Prisma.PortfolioProjectUpdateInput
) {
  return db.portfolioProject.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function deletePortfolioProject(id: string, userId: string) {
  return db.portfolioProject.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function togglePortfolioProjectPublished(id: string, userId: string) {
  const project = await db.portfolioProject.findFirst({
    where: { id, userId },
  });

  if (!project) {
    throw new Error('Portfolio project not found');
  }

  return db.portfolioProject.update({
    where: { id, userId },
    data: {
      isPublished: !project.isPublished,
    },
  });
}

export async function togglePortfolioProjectFeatured(id: string, userId: string) {
  const project = await db.portfolioProject.findFirst({
    where: { id, userId },
  });

  if (!project) {
    throw new Error('Portfolio project not found');
  }

  return db.portfolioProject.update({
    where: { id, userId },
    data: {
      isFeatured: !project.isFeatured,
    },
  });
}

export async function reorderPortfolioProjects(
  userId: string,
  projectIds: string[]
) {
  const updates = projectIds.map((id, index) =>
    db.portfolioProject.update({
      where: { id, userId },
      data: { order: index },
    })
  );

  await db.$transaction(updates);
}

export async function getPortfolioStats(userId: string) {
  const [totalProjects, publishedProjects, featuredProjects, technologies] = await Promise.all([
    db.portfolioProject.count({ where: { userId } }),
    db.portfolioProject.count({ where: { userId, isPublished: true } }),
    db.portfolioProject.count({ where: { userId, isFeatured: true } }),
    db.portfolioProject.findMany({
      where: { userId },
      select: { technologies: true },
    }),
  ]);

  // Flatten and count unique technologies
  const allTechnologies = technologies.flatMap(p => p.technologies);
  const uniqueTechnologies = [...new Set(allTechnologies)];

  return {
    totalProjects,
    publishedProjects,
    featuredProjects,
    uniqueTechnologies: uniqueTechnologies.length,
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}