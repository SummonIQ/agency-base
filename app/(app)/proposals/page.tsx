import { auth } from '@/lib/auth/server';
import { getProposals, getProposalStats } from '@/lib/proposals';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassyContainer } from '@/components/ui/glassy-edge';
import { 
  FileText, 
  DollarSign, 
  Send, 
  Plus, 
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Target
} from 'lucide-react';

export default async function ProposalsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [proposals, stats] = await Promise.all([
    getProposals(session.user.id),
    getProposalStats(session.user.id),
  ]);

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    VIEWED: 'bg-purple-100 text-purple-800',
    NEGOTIATING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    EXPIRED: 'bg-orange-100 text-orange-800',
  };

  const statusIcons = {
    DRAFT: FileText,
    SENT: Send,
    VIEWED: Eye,
    NEGOTIATING: Clock,
    ACCEPTED: CheckCircle,
    REJECTED: XCircle,
    EXPIRED: Clock,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-muted-foreground">Manage your project proposals and contracts</p>
        </div>
        <div className="flex gap-2">
          <Link href="/proposals/templates">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/proposals/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Proposal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Proposals</div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.totalProposals}</div>
          </div>
        </GlassyContainer>
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Sent</div>
              <Send className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.sentProposals}</div>
          </div>
        </GlassyContainer>
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Acceptance Rate</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.acceptedProposals} of {stats.sentProposals} accepted
            </p>
          </div>
        </GlassyContainer>
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Value</div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toLocaleString()}
            </div>
          </div>
        </GlassyContainer>
      </div>

      {/* Proposals List */}
      <div className="grid gap-4">
        {proposals.length === 0 ? (
          <GlassyContainer edges={[]}>
            <div className="flex flex-col items-center justify-center py-12 p-6">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No proposals yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first proposal to start winning clients
              </p>
              <Link href="/proposals/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Proposal
                </Button>
              </Link>
            </div>
          </GlassyContainer>
        ) : (
          proposals.map((proposal) => {
            const StatusIcon = statusIcons[proposal.status];
            const isExpired = new Date(proposal.validUntil) < new Date() && proposal.status !== 'ACCEPTED';
            const daysUntilExpiry = Math.ceil((new Date(proposal.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <GlassyContainer key={proposal.id} edges={[]} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        <Link 
                          href={`/proposals/${proposal.id}`}
                          className="hover:underline"
                        >
                          {proposal.title}
                        </Link>
                        <Badge className={statusColors[proposal.status]}>
                          {proposal.status}
                        </Badge>
                        {isExpired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-4">
                          {proposal.client && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {proposal.client.name}
                            </span>
                          )}
                          {proposal.lead && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {proposal.lead.title}
                            </span>
                          )}
                          <span className="text-sm">
                            {proposal._count.proposalItems} line items
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-lg">
                          ${proposal.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valid until {new Date(proposal.validUntil).toLocaleDateString()}
                        {!isExpired && daysUntilExpiry > 0 && (
                          <span className="ml-1">({daysUntilExpiry} days)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      {proposal.sentAt && (
                        <Badge variant="outline">
                          Sent {new Date(proposal.sentAt).toLocaleDateString()}
                        </Badge>
                      )}
                      {proposal.viewedAt && (
                        <Badge variant="outline">
                          Viewed {new Date(proposal.viewedAt).toLocaleDateString()}
                        </Badge>
                      )}
                      {proposal.acceptedAt && (
                        <Badge variant="outline">
                          Accepted {new Date(proposal.acceptedAt).toLocaleDateString()}
                        </Badge>
                      )}
                      {proposal.rejectedAt && (
                        <Badge variant="outline">
                          Rejected {new Date(proposal.rejectedAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/proposals/${proposal.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/proposals/${proposal.id}`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                      {proposal.status === 'DRAFT' && (
                        <Button size="sm" variant="default">
                          <Send className="mr-1 h-3 w-3" />
                          Send
                        </Button>
                      )}
                      {proposal.status === 'ACCEPTED' && !proposal.contract && (
                        <Button size="sm" variant="default">
                          Create Contract
                        </Button>
                      )}
                      {proposal.shareToken && (
                        <Button size="sm" variant="outline">
                          Share
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassyContainer>
            );
          })
        )}
      </div>
    </div>
  );
}