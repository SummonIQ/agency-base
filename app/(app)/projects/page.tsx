import { auth } from '@/lib/auth/server';
import { getProjects, getProjectStats } from '@/lib/projects';
import { getClients } from '@/lib/clients';
import { headers } from 'next/headers';
import { ProjectsClient } from './projects-client';

export default async function ProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [projects, stats, clients] = await Promise.all([
    getProjects(session.user.id),
    getProjectStats(session.user.id),
    getClients(session.user.id),
  ]);

  // Map clients to simple objects for the modal
  const clientsList = clients.map(client => ({
    id: client.id,
    name: client.name
  }));

  return <ProjectsClient projects={projects} stats={stats} clients={clientsList} />;
}