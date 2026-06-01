import { auth } from '@/lib/auth/server';
import { getTeamMembers } from '@/lib/team-members';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Star,
  Edit,
  Trash2
} from 'lucide-react';

export default async function TeamMembersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const teamMembers = await getTeamMembers(session.user.id);

  const getSkillColor = (index: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    return colors[index % colors.length];
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      DEVELOPER: 'bg-purple-100 text-purple-800',
      DESIGNER: 'bg-pink-100 text-pink-800',
      PROJECT_MANAGER: 'bg-blue-100 text-blue-800',
      MARKETER: 'bg-green-100 text-green-800',
      SALES: 'bg-orange-100 text-orange-800',
      SUPPORT: 'bg-yellow-100 text-yellow-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team and their assignments</p>
        </div>
        <Link href="/team-members/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => m.status === 'ON_LEAVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(teamMembers.map(m => m.department || 'Unknown')).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </div>
                <Badge className={getRoleColor(member.role)}>
                  {member.role.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    <span>{member.department}</span>
                  </div>
                )}
              </div>

              {member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className={`text-xs ${getSkillColor(index)}`}>
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
                <div className="flex gap-2">
                  <Link href={`/team-members/${member.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {member.hourlyRate && (
                <div className="text-xs text-muted-foreground">
                  ${member.hourlyRate}/hour
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add team members to track their work and assignments
            </p>
            <Link href="/team-members/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Team Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}