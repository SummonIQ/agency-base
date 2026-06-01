import { auth } from '@/lib/auth/server';
import { getProposal, sendProposal, createContractFromProposal } from '@/lib/proposals';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassyContainer } from '@/components/ui/glassy-edge';
import { 
  ArrowLeft,
  Edit,
  Send,
  Eye,
  Building2,
  Target,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Copy,
  Download,
  Share
} from 'lucide-react';
import ProposalActions from '@/components/proposals/proposal-actions';

interface ProposalDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProposalDetailPage({ params }: ProposalDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const proposal = await getProposal(params.id, session.user.id);

  if (!proposal) {
    notFound();
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    VIEWED: 'bg-purple-100 text-purple-800',
    NEGOTIATING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-orange-100 text-orange-800',
  };

  const isExpired = new Date(proposal.validUntil) < new Date() && proposal.status !== 'ACCEPTED';
  const canCreateContract = proposal.status === 'ACCEPTED' && !proposal.contract;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{proposal.title}</h1>
              <Badge className={statusColors[proposal.status]}>
                {proposal.status}
              </Badge>
              {isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              {proposal.client && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {proposal.client.name}
                </span>
              )}
              {proposal.lead && (
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {proposal.lead.title}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Valid until {new Date(proposal.validUntil).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/proposals/${proposal.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          <ProposalActions proposal={proposal} userId={session.user.id} />
        </div>
      </div>

      {/* Proposal Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          {proposal.executiveSummary && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
                <div className="prose prose-sm max-w-none">
                  {proposal.executiveSummary.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Scope of Work */}
          {proposal.scope && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Scope of Work</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {proposal.scope}
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Timeline */}
          {proposal.timeline && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Timeline & Deliverables</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {proposal.timeline}
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Pricing Breakdown */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
              <div className="space-y-3">
                {proposal.proposalItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × ${item.rate.toLocaleString()}
                      </p>
                    </div>
                    <div className="font-semibold">
                      ${item.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {proposal.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassyContainer>

          {/* Terms & Conditions */}
          {proposal.terms && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {proposal.terms}
                </div>
              </div>
            </GlassyContainer>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Timing */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4">Proposal Status</h3>
              <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge className={statusColors[proposal.status]}>
                    {proposal.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="text-sm">{new Date(proposal.createdAt).toLocaleDateString()}</span>
                </div>
                
                {proposal.sentAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sent:</span>
                    <span className="text-sm">{new Date(proposal.sentAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {proposal.viewedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Viewed:</span>
                    <span className="text-sm">{new Date(proposal.viewedAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {proposal.acceptedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accepted:</span>
                    <span className="text-sm">{new Date(proposal.acceptedAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {proposal.rejectedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rejected:</span>
                    <span className="text-sm">{new Date(proposal.rejectedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              </div>
            </div>
          </GlassyContainer>

          {/* Financial Summary */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4">Financial Summary</h3>
              <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Line Items:</span>
                <span className="text-sm font-medium">{proposal.proposalItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Value:</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {proposal.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Valid Until:</span>
                <span className="text-sm">{new Date(proposal.validUntil).toLocaleDateString()}</span>
              </div>
              </div>
            </div>
          </GlassyContainer>

          {/* Related Records */}
          {(proposal.contract || proposal.lead) && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h3 className="text-sm font-semibold mb-4">Related Records</h3>
                <div className="space-y-2">
                {proposal.contract && (
                  <Link href={`/contracts/${proposal.contract.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      View Contract
                    </Button>
                  </Link>
                )}
                
                {proposal.lead && (
                  <Link href={`/agency-leads/${proposal.lead.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Target className="mr-2 h-4 w-4" />
                      View Lead
                    </Button>
                  </Link>
                )}
                
                {proposal.client && (
                  <Link href={`/clients/${proposal.client.id}`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Building2 className="mr-2 h-4 w-4" />
                      View Client
                    </Button>
                  </Link>
                )}
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Actions */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
              <h3 className="text-sm font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Proposal
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share className="mr-2 h-4 w-4" />
                Share Link
              </Button>
              </div>
            </div>
          </GlassyContainer>
        </div>
      </div>
    </div>
  );
}