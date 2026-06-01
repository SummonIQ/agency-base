import { db } from '@/lib/db';

export interface CreateTeamMemberData {
  name: string;
  email: string;
  role?: string;
  department?: string;
  skills?: string[];
  availability?: string;
  image?: string;
  userId: string;
}

export interface UpdateTeamMemberData {
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  skills?: string[];
  availability?: string;
  image?: string;
}

export interface TeamMemberFilters {
  role?: string;
  department?: string;
  availability?: string;
  skills?: string[];
}

export async function createTeamMember(data: CreateTeamMemberData) {
  const teamMember = await db.teamMember.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      skills: data.skills || [],
      availability: data.availability || 'available',
      image: data.image,
      userId: data.userId,
    },
    include: {
      assignedTasks: {
        include: {
          project: true,
        },
      },
      actionTasks: true,
    },
  });

  return teamMember;
}

export async function getTeamMembers(userId: string, filters: TeamMemberFilters = {}) {
  const where: any = { userId };

  if (filters.role) {
    where.role = { contains: filters.role, mode: 'insensitive' };
  }

  if (filters.department) {
    where.department = { contains: filters.department, mode: 'insensitive' };
  }

  if (filters.availability) {
    where.availability = filters.availability;
  }

  if (filters.skills && filters.skills.length > 0) {
    where.skills = {
      hasSome: filters.skills,
    };
  }

  const teamMembers = await db.teamMember.findMany({
    where,
    include: {
      assignedTasks: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      },
      actionTasks: {
        where: {
          status: {
            not: 'COMPLETED',
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          assignedTasks: true,
          actionTasks: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return teamMembers;
}

export async function getTeamMember(id: string, userId: string) {
  const teamMember = await db.teamMember.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      assignedTasks: {
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      },
      actionTasks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return teamMember;
}

export async function updateTeamMember(id: string, userId: string, updateData: UpdateTeamMemberData) {
  const teamMember = await db.teamMember.findFirst({
    where: { id, userId },
  });

  if (!teamMember) {
    throw new Error('Team member not found');
  }

  const updatedTeamMember = await db.teamMember.update({
    where: { id },
    data: {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.email && { email: updateData.email }),
      ...(updateData.role !== undefined && { role: updateData.role }),
      ...(updateData.department !== undefined && { department: updateData.department }),
      ...(updateData.skills !== undefined && { skills: updateData.skills }),
      ...(updateData.availability && { availability: updateData.availability }),
      ...(updateData.image !== undefined && { image: updateData.image }),
    },
    include: {
      assignedTasks: {
        include: {
          project: true,
        },
      },
      actionTasks: true,
    },
  });

  return updatedTeamMember;
}

export async function deleteTeamMember(id: string, userId: string) {
  const teamMember = await db.teamMember.findFirst({
    where: { id, userId },
  });

  if (!teamMember) {
    throw new Error('Team member not found');
  }

  // Check if team member has assigned tasks
  const tasksCount = await db.task.count({
    where: { assigneeId: id },
  });

  const actionTasksCount = await db.actionTask.count({
    where: { assigneeId: id },
  });

  if (tasksCount > 0 || actionTasksCount > 0) {
    throw new Error('Cannot delete team member with assigned tasks. Please reassign tasks first.');
  }

  await db.teamMember.delete({
    where: { id },
  });

  return { success: true };
}

export async function getAvailableTeamMembers(userId: string) {
  const teamMembers = await db.teamMember.findMany({
    where: {
      userId,
      availability: 'available',
    },
    select: {
      id: true,
      name: true,
      role: true,
      skills: true,
      _count: {
        select: {
          assignedTasks: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return teamMembers;
}

export async function assignTaskToTeamMember(taskId: string, teamMemberId: string, userId: string) {
  // Verify the team member belongs to the user
  const teamMember = await db.teamMember.findFirst({
    where: {
      id: teamMemberId,
      userId,
    },
  });

  if (!teamMember) {
    throw new Error('Team member not found');
  }

  // Update the task
  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: { assigneeId: teamMemberId },
    include: {
      assignee: true,
      project: true,
    },
  });

  return updatedTask;
}

export async function unassignTaskFromTeamMember(taskId: string, userId: string) {
  const updatedTask = await db.task.update({
    where: { id: taskId },
    data: { assigneeId: null },
    include: {
      project: true,
    },
  });

  return updatedTask;
}

export function getTeamMemberStats(teamMembers: any[]) {
  const stats = {
    total: teamMembers.length,
    available: 0,
    busy: 0,
    unavailable: 0,
    totalTasks: 0,
    totalActionTasks: 0,
    departments: new Set<string>(),
    roles: new Set<string>(),
    skills: new Set<string>(),
  };

  for (const member of teamMembers) {
    // Availability counts
    switch (member.availability) {
      case 'available':
        stats.available++;
        break;
      case 'busy':
        stats.busy++;
        break;
      case 'unavailable':
        stats.unavailable++;
        break;
    }

    // Task counts
    stats.totalTasks += member._count?.assignedTasks || member.assignedTasks?.length || 0;
    stats.totalActionTasks += member._count?.actionTasks || member.actionTasks?.length || 0;

    // Collect unique departments, roles, and skills
    if (member.department) stats.departments.add(member.department);
    if (member.role) stats.roles.add(member.role);
    member.skills?.forEach((skill: string) => stats.skills.add(skill));
  }

  return {
    ...stats,
    departments: Array.from(stats.departments),
    roles: Array.from(stats.roles),
    skills: Array.from(stats.skills),
  };
}