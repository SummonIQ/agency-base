import { auth } from '@/lib/auth/server';
import { getProposal } from '@/lib/proposals';
import { getClients } from '@/lib/clients';
import { getAgencyLeads } from '@/lib/agency-leads';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ProposalForm from '@/components/proposals/proposal-form';

interface EditProposalPageProps {
  params: {
    id: string;
  };
}

export default async function EditProposalPage({ params }: EditProposalPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [proposal, clients, leads] = await Promise.all([
    getProposal(params.id, session.user.id),
    getClients(session.user.id),
    getAgencyLeads(session.user.id),
  ]);

  if (!proposal) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Proposal</h1>
          <p className="text-muted-foreground">
            Update your proposal details and pricing
          </p>
        </div>

        <ProposalForm 
          clients={clients}
          leads={leads}
          userId={session.user.id}
          initialData={proposal}
          isEditing={true}
        />
      </div>
    </div>
  );
}