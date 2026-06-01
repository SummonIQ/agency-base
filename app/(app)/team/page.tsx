import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Users, UserCheck, UserX, Briefcase } from 'lucide-react';
import { auth } from '@/lib/auth/server';
import { getTeamMembers, getTeamMemberStats } from '@/lib/team-members';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { redirect } from 'next/navigation';

interface SearchParams {
  role?: string;
  department?: string;
  availability?: string;
  skills?: string;
}

interface TeamPageProps {
  searchParams: Promise<SearchParams>;
}

async function TeamMembersList({
  role,
  department,
  availability,
  skills
}: {
  role?: string;
  department?: string;
  availability?: string;
  skills?: string;
}) {
  const session = await auth.api.getSession({
    headers: {},
  });

  if (!session?.user) {
    redirect('/login');
  }

  const filters: any = {};
  if (role) filters.role = role;
  if (department) filters.department = department;
  if (availability) filters.availability = availability;
  if (skills) filters.skills = skills.split(',');

  const teamMembers = await getTeamMembers(session.user.id, filters);
  const stats = getTeamMemberStats(teamMembers);

  const getAvailabilityBadgeVariant = (availability: string) => {
    switch (availability) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'unavailable': return 'destructive';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.roles.length} roles, {stats.departments.length} departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">
              Ready for new tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.busy}</div>
            <p className="text-xs text-muted-foreground">
              Currently occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalActionTasks} action items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team and assign tasks to members.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/team/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-6">
                Add team members to start assigning tasks and managing workload.
              </p>
              <Button asChild>
                <Link href="/team/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Team Member
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.image || undefined} alt={member.name} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div>
                          <Link
                            href={`/team/${member.id}`}
                            className="font-semibold hover:underline"
                          >
                            {member.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant={getAvailabilityBadgeVariant(member.availability)}>
                            {member.availability}
                          </Badge>
                          {member.role && (
                            <Badge variant="outline">{member.role}</Badge>
                          )}
                        </div>

                        {member.department && (
                          <p className="text-sm text-muted-foreground">
                            {member.department}
                          </p>
                        )}

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            {member._count?.assignedTasks || 0} tasks
                          </span>
                          <span className="text-muted-foreground">
                            {member._count?.actionTasks || 0} actions
                          </span>
                        </div>

                        {member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{member.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {member.assignedTasks.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Recent tasks:</p>
                            {member.assignedTasks.slice(0, 2).map((task) => (
                              <div key={task.id} className="text-xs text-muted-foreground">
                                • {task.title}
                                {task.project && ` (${task.project.name})`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const params = await searchParams;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage team members and assign tasks.
          </p>
        </div>

        <Button asChild>
          <Link href="/team/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TeamMembersList
          role={params.role}
          department={params.department}
          availability={params.availability}
          skills={params.skills}
        />
      </Suspense>
    </div>
  );
}