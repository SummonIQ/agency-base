import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Code,
  Palette,
  Users,
  Settings,
  GraduationCap,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';
import { proposalTemplates } from '@/lib/proposal-templates';

const categoryIcons = {
  development: Code,
  design: Palette,
  consulting: Users,
  maintenance: Settings,
  training: GraduationCap,
};

const categoryColors = {
  development: 'bg-blue-100 text-blue-800',
  design: 'bg-purple-100 text-purple-800',
  consulting: 'bg-green-100 text-green-800',
  maintenance: 'bg-orange-100 text-orange-800',
  training: 'bg-indigo-100 text-indigo-800',
};

export default async function ProposalTemplatesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const templatesByCategory = proposalTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof proposalTemplates>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proposals">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Proposals
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Proposal Templates</h1>
            <p className="text-muted-foreground">
              Jump-start your proposals with pre-built templates
            </p>
          </div>
        </div>
        <Link href="/proposals/new">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Start from Scratch
          </Button>
        </Link>
      </div>

      {/* Templates by Category */}
      <div className="space-y-8">
        {Object.entries(templatesByCategory).map(([category, templates]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <CategoryIcon className="h-6 w-6" />
                <h2 className="text-2xl font-semibold capitalize">{category}</h2>
                <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => {
                  const defaultTotal = template.defaultItems.reduce(
                    (sum, item) => sum + (item.quantity * item.rate), 
                    0
                  );
                  
                  return (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {template.description}
                            </CardDescription>
                          </div>
                          <Badge className={categoryColors[template.category]}>
                            {template.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Template Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{template.defaultItems.length} line items</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${defaultTotal.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {/* Preview of first few items */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Includes:</p>
                          <div className="space-y-1">
                            {template.defaultItems.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                • {item.description}
                              </div>
                            ))}
                            {template.defaultItems.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                + {template.defaultItems.length - 3} more items
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/proposals/templates/${template.id}/preview`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Preview
                            </Button>
                          </Link>
                          <Link href={`/proposals/new?template=${template.id}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              Use Template
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
    </div>
  );
}