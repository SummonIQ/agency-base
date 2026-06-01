import { auth } from '@/lib/auth/server';
import { defaultOutreachTemplates } from '@/lib/outreach/templates';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  Eye,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Target,
  CheckCircle
} from 'lucide-react';
import TemplateImportButton from '@/components/outreach/template-import-button';

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

export default async function TemplateLibraryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Group templates by category
  const templatesByCategory = defaultOutreachTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof defaultOutreachTemplates>);

  const categories = [
    { key: 'cold_outreach', label: 'Cold Outreach', description: 'Break the ice with new prospects' },
    { key: 'follow_up', label: 'Follow-up', description: 'Stay persistent without being pushy' },
    { key: 'nurturing', label: 'Nurturing', description: 'Build long-term relationships' },
    { key: 'proposal', label: 'Proposals', description: 'Close the deal professionally' },
    { key: 'social', label: 'Social Media', description: 'Connect on LinkedIn and social platforms' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/outreach/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-muted-foreground">Professional templates to jumpstart your outreach</p>
        </div>
      </div>

      {/* Introduction */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Proven Templates for Every Situation</h2>
              <p className="text-muted-foreground mb-4">
                These templates are based on best practices and have been tested across various industries. 
                Each template includes variable placeholders that you can customize for your specific needs.
              </p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Customizable Variables</Badge>
                <Badge variant="outline">Industry Tested</Badge>
                <Badge variant="outline">High Response Rates</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Categories */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryTemplates = templatesByCategory[category.key] || [];
          
          return (
            <div key={category.key} className={`p-6 rounded-lg border-2 ${categoryColors[category.key as keyof typeof categoryColors]}`}>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">{category.label}</h2>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {categoryTemplates.map((template) => {
                  const TypeIcon = templateTypeIcons[template.type as keyof typeof templateTypeIcons] || Mail;
                  
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow bg-white">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <TypeIcon className="h-5 w-5" />
                              {template.name}
                            </CardTitle>
                            {template.subject && (
                              <CardDescription className="mt-2 font-mono text-xs bg-muted px-2 py-1 rounded">
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
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        
                        {/* Content Preview */}
                        <div className="bg-muted p-3 rounded text-xs font-mono max-h-32 overflow-hidden">
                          {template.content.substring(0, 200)}...
                        </div>
                        
                        {/* Variables */}
                        {template.variables.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Variables to customize:</div>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.slice(0, 6).map((variable) => (
                                <Badge key={variable} variant="outline" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                              {template.variables.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.variables.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <TemplateImportButton 
                            template={template}
                            userId={session.user.id}
                          />
                          <Link href={`/outreach/templates/library/${template.id}/preview`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </Button>
                          </Link>
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

      {/* Call to Action */}
      <Card className="text-center py-8">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Need a Custom Template?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Create your own template from scratch.
          </p>
          <Link href="/outreach/templates/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Custom Template
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}