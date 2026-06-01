import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Zap,
  Target,
  TrendingUp,
  Star,
  Filter,
  Share2,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  MoreVertical
} from 'lucide-react';

export default async function TalentPoolsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Mock data for talent pools
  const talentPools = [
    {
      id: '1',
      name: 'Senior Engineers',
      description: 'Experienced engineers with 5+ years in production environments',
      category: 'Engineering',
      candidateCount: 45,
      activeCount: 32,
      qualityScore: 4.5,
      tags: ['React', 'Node.js', 'AWS', 'Python'],
      lastUpdated: new Date('2024-06-20'),
      createdAt: new Date('2024-04-01'),
    },
    {
      id: '2',
      name: 'Product Managers',
      description: 'PMs with experience in B2B SaaS products',
      category: 'Product',
      candidateCount: 28,
      activeCount: 20,
      qualityScore: 4.2,
      tags: ['B2B', 'SaaS', 'Agile', 'Analytics'],
      lastUpdated: new Date('2024-06-19'),
      createdAt: new Date('2024-03-15'),
    },
    {
      id: '3',
      name: 'UX/UI Designers',
      description: 'Designers specializing in modern web and mobile interfaces',
      category: 'Design',
      candidateCount: 35,
      activeCount: 25,
      qualityScore: 4.3,
      tags: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      lastUpdated: new Date('2024-06-18'),
      createdAt: new Date('2024-05-01'),
    },
    {
      id: '4',
      name: 'Data Scientists',
      description: 'ML engineers and data scientists with production experience',
      category: 'Data',
      candidateCount: 22,
      activeCount: 18,
      qualityScore: 4.6,
      tags: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      lastUpdated: new Date('2024-06-21'),
      createdAt: new Date('2024-02-10'),
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Engineering: 'bg-purple-100 text-purple-800',
      Product: 'bg-blue-100 text-blue-800',
      Design: 'bg-pink-100 text-pink-800',
      Data: 'bg-green-100 text-green-800',
      Sales: 'bg-orange-100 text-orange-800',
      Marketing: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTagColor = (index: number) => {
    const colors = ['bg-slate-100 text-slate-800', 'bg-zinc-100 text-zinc-800', 'bg-stone-100 text-stone-800'];
    return colors[index % colors.length];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Talent Pools</h1>
          <p className="text-muted-foreground">Organize and nurture your candidate pipeline</p>
        </div>
        <Link href="/recruiting/talent-pools/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Pool
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pools</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{talentPools.length}</div>
            <p className="text-xs text-muted-foreground">Active talent pools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talentPools.reduce((sum, pool) => sum + pool.candidateCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all pools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {talentPools.reduce((sum, pool) => sum + pool.activeCount, 0)}
            </div>
            <p className="text-xs text-green-600">75% engagement rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.4</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Talent Pools Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {talentPools.map((pool) => (
          <Card key={pool.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{pool.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {pool.description}
                  </CardDescription>
                </div>
                <Badge className={getCategoryColor(pool.category)}>
                  {pool.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Users className="h-3 w-3" />
                    Total
                  </div>
                  <div className="font-semibold">{pool.candidateCount}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Zap className="h-3 w-3" />
                    Active
                  </div>
                  <div className="font-semibold text-green-600">{pool.activeCount}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Star className="h-3 w-3" />
                    Quality
                  </div>
                  <div className="font-semibold flex items-center gap-1">
                    {pool.qualityScore}
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {pool.tags.map((tag, index) => (
                  <Badge key={tag} variant="secondary" className={`text-xs ${getTagColor(index)}`}>
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Updated {pool.lastUpdated.toLocaleDateString()}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Link href={`/recruiting/talent-pools/${pool.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {talentPools.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No talent pools yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create talent pools to organize and nurture your candidate pipeline
            </p>
            <Link href="/recruiting/talent-pools/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Pool
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}