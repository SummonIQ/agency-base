import { getTemplateById } from '@/lib/proposal-templates';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  DollarSign,
  Target,
  FileText,
  Code,
  Palette,
  Users,
  Settings,
  GraduationCap
} from 'lucide-react';

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

interface TemplatePreviewPageProps {
  params: {
    id: string;
  };
}

export default function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
  const template = getTemplateById(params.id);

  if (!template) {
    notFound();
  }

  const CategoryIcon = categoryIcons[template.category];
  const totalAmount = template.defaultItems.reduce(
    (sum, item) => sum + (item.quantity * item.rate), 
    0
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/proposals/templates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CategoryIcon className="h-6 w-6" />
              <h1 className="text-3xl font-bold">{template.name}</h1>
              <Badge className={categoryColors[template.category]}>
                {template.category}
              </Badge>
            </div>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/proposals/new?template=${template.id}`}>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Use This Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Template Content Preview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {template.executiveSummary}
              </div>
            </CardContent>
          </Card>

          {/* Scope of Work */}
          <Card>
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {template.scope}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {template.timeline}
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {template.terms}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Template Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Category:</span>
                <Badge className={categoryColors[template.category]}>
                  {template.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Line Items:</span>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{template.defaultItems.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Value:</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Default Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.defaultItems.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium leading-tight">{item.description}</p>
                      <span className="text-sm font-semibold ml-2">
                        ${(item.quantity * item.rate).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × ${item.rate.toLocaleString()}
                    </p>
                  </div>
                ))}
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/proposals/new?template=${template.id}`}>
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Use This Template
                </Button>
              </Link>
              <Link href="/proposals/new">
                <Button variant="outline" className="w-full">
                  Start from Scratch
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}