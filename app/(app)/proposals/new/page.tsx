import { auth } from '@/lib/auth/server';
import { getClients } from '@/lib/clients';
import { getAgencyLeads } from '@/lib/agency-leads';
import { getTemplateById } from '@/lib/proposal-templates';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import ProposalForm from '@/components/proposals/proposal-form';

interface NewProposalPageProps {
  searchParams: {
    template?: string;
  };
}

export default async function NewProposalPage({ searchParams }: NewProposalPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const [clients, leads] = await Promise.all([
    getClients(session.user.id),
    getAgencyLeads(session.user.id),
  ]);

  // Load template data if template ID provided
  const template = searchParams.template ? getTemplateById(searchParams.template) : null;
  
  const templateData = template ? {
    title: template.name,
    executiveSummary: template.executiveSummary,
    scope: template.scope,
    timeline: template.timeline,
    terms: template.terms,
    proposalItems: template.defaultItems.map(item => ({
      ...item,
      amount: item.quantity * item.rate,
    })),
  } : null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {template ? `Create from Template: ${template.name}` : 'Create Proposal'}
            </h1>
            <p className="text-muted-foreground">
              {template 
                ? `Using the ${template.name} template as a starting point`
                : 'Create a new proposal for your client or lead'
              }
            </p>
          </div>
          {!template && (
            <Link href="/proposals/templates">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </Link>
          )}
        </div>

        <ProposalForm 
          clients={clients}
          leads={leads}
          userId={session.user.id}
          initialData={templateData}
        />
      </div>
    </div>
  );
}