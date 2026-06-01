import { auth } from '@/lib/auth/server';
import { getOutreachTemplates } from '@/lib/outreach';
import { defaultOutreachTemplates } from '@/lib/outreach/templates';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Copy,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Phone,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  Target
} from 'lucide-react';
import OutreachTemplateActions from '@/components/outreach/template-actions';

const templateTypeIcons = {
  cold_email: Mail,
  follow_up: Mail,
  proposal_follow_up: Mail,
  linkedin_connect: Users,
  linkedin_message: MessageSquare,
  thank_you: Mail,
  check_in: Calendar,
  referral_request: Target,
};

const templateTypeColors = {
  cold_email: 'bg-blue-100 text-blue-800',
  follow_up: 'bg-green-100 text-green-800',
  proposal_follow_up: 'bg-purple-100 text-purple-800',
  linkedin_connect: 'bg-indigo-100 text-indigo-800',
  linkedin_message: 'bg-indigo-100 text-indigo-800',
  thank_you: 'bg-yellow-100 text-yellow-800',
  check_in: 'bg-orange-100 text-orange-800',
  referral_request: 'bg-pink-100 text-pink-800',
};

const categoryColors = {
  cold_outreach: 'bg-red-50 border-red-200',
  follow_up: 'bg-green-50 border-green-200',
  nurturing: 'bg-blue-50 border-blue-200',
  proposal: 'bg-purple-50 border-purple-200',
  social: 'bg-indigo-50 border-indigo-200',
};

export default async function OutreachTemplatesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const templates = await getOutreachTemplates(session.user.id);

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    // Find the default template to get category info
    const defaultTemplate = defaultOutreachTemplates.find(dt => dt.type === template.type);
    const category = defaultTemplate?.category || 'cold_outreach';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const categories = [
    { key: 'cold_outreach', label: 'Cold Outreach', description: 'Initial contact templates' },
    { key: 'follow_up', label: 'Follow-up', description: 'Response and follow-up templates' },
    { key: 'nurturing', label: 'Nurturing', description: 'Relationship building templates' },
    { key: 'proposal', label: 'Proposals', description: 'Proposal and contract related' },
    { key: 'social', label: 'Social Media', description: 'LinkedIn and social templates' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Outreach Templates</h1>
          <p className="text-muted-foreground">Create and manage email templates for client outreach</p>
        </div>
        <div className="flex gap-2">
          <Link href="/outreach/templates/library">
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Template Library
            </Button>
          </Link>
          <Link href="/outreach/templates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Times Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.timesSent, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.responsesReceived, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length > 0 
                ? Math.round(templates.reduce((sum, t) => sum + t.responseRate, 0) / templates.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <Mail className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-2">No templates yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first outreach template or browse our template library
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/outreach/templates/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </Link>
                <Link href="/outreach/templates/library">
                  <Button variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Browse Library
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryTemplates = templatesByCategory[category.key] || [];
            
            if (categoryTemplates.length === 0) return null;
            
            return (
              <div key={category.key} className={`p-6 rounded-lg border-2 ${categoryColors[category.key as keyof typeof categoryColors]}`}>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{category.label}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryTemplates.map((template) => {
                    const TypeIcon = templateTypeIcons[template.type as keyof typeof templateTypeIcons] || Mail;
                    
                    return (
                      <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <TypeIcon className="h-5 w-5" />
                                <Link 
                                  href={`/outreach/templates/${template.id}`}
                                  className="hover:underline"
                                >
                                  {template.name}
                                </Link>
                              </CardTitle>
                              {template.subject && (
                                <CardDescription className="mt-2 font-mono text-xs">
                                  {template.subject}
                                </CardDescription>
                              )}
                            </div>
                            <Badge className={templateTypeColors[template.type as keyof typeof templateTypeColors]}>
                              {template.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.content.substring(0, 120)}...
                          </p>
                          
                          {/* Performance Metrics */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-sm font-medium">{template.timesSent}</div>
                              <div className="text-xs text-muted-foreground">Sent</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{template.responsesReceived}</div>
                              <div className="text-xs text-muted-foreground">Responses</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{Math.round(template.responseRate)}%</div>
                              <div className="text-xs text-muted-foreground">Rate</div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <OutreachTemplateActions 
                              template={template} 
                              userId={session.user.id}
                            />
                            <div className="flex gap-1">
                              <Link href={`/outreach/templates/${template.id}/preview`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/outreach/templates/${template.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}