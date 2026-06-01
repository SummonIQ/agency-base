import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Trash2,
  Star,
  Clock,
  Layout,
  Mail,
  MoreVertical
} from 'lucide-react';

export default async function EmailTemplatesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Mock data for templates
  const templates = [
    {
      id: '1',
      name: 'Welcome Email',
      category: 'onboarding',
      description: 'Send to new subscribers to introduce your brand',
      usedCount: 245,
      lastUsed: new Date('2024-06-20'),
      createdAt: new Date('2024-01-15'),
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Product Announcement',
      category: 'promotional',
      description: 'Announce new products or features to your audience',
      usedCount: 89,
      lastUsed: new Date('2024-06-18'),
      createdAt: new Date('2024-03-10'),
      isFavorite: false,
    },
    {
      id: '3',
      name: 'Monthly Newsletter',
      category: 'newsletter',
      description: 'Regular monthly update to keep subscribers engaged',
      usedCount: 156,
      lastUsed: new Date('2024-06-01'),
      createdAt: new Date('2024-02-20'),
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Cart Abandonment',
      category: 'transactional',
      description: 'Recover abandoned carts with a reminder email',
      usedCount: 412,
      lastUsed: new Date('2024-06-21'),
      createdAt: new Date('2024-01-05'),
      isFavorite: false,
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      onboarding: 'bg-blue-100 text-blue-800',
      promotional: 'bg-purple-100 text-purple-800',
      newsletter: 'bg-green-100 text-green-800',
      transactional: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Create and manage reusable email templates</p>
        </div>
        <Link href="/email-automation/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Cart Abandonment</div>
            <p className="text-xs text-muted-foreground">412 uses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Template types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter(t => t.isFavorite).length}</div>
            <p className="text-xs text-muted-foreground">Quick access templates</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {template.name}
                    {template.isFavorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {template.usedCount} uses
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last used {new Date(template.lastUsed).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Copy className="h-3 w-3 mr-1" />
                  Duplicate
                </Button>
                <Link href={`/email-automation/templates/${template.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first email template to speed up your campaigns
            </p>
            <Link href="/email-automation/templates/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}