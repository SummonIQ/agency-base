import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  Eye
} from 'lucide-react';
import ClientProposalActions from '@/components/proposals/client-proposal-actions';

interface SharedProposalPageProps {
  params: {
    token: string;
  };
}

export default async function SharedProposalPage({ params }: SharedProposalPageProps) {
  // Find proposal by sharing token
  const proposal = await db.proposal.findFirst({
    where: {
      shareToken: params.token,
    },
    include: {
      client: true,
      lead: true,
      proposalItems: {
        orderBy: { id: 'asc' },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!proposal) {
    notFound();
  }

  // Mark as viewed if not already
  if (!proposal.viewedAt && proposal.status === 'SENT') {
    await db.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'VIEWED',
        viewedAt: new Date(),
      },
    });
  }

  const isExpired = new Date(proposal.validUntil) < new Date() && proposal.status !== 'ACCEPTED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{proposal.title}</h1>
                {!isExpired && (
                  <Badge className="bg-green-100 text-green-800">
                    Active Proposal
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive">
                    Expired
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  From {proposal.user.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Valid until {new Date(proposal.validUntil).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 mb-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold text-green-600">
                  {proposal.totalAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total Project Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Executive Summary */}
            {proposal.executiveSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {proposal.executiveSummary.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scope of Work */}
            {proposal.scope && (
              <Card>
                <CardHeader>
                  <CardTitle>Scope of Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {proposal.scope}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {proposal.timeline && (
              <Card>
                <CardHeader>
                  <CardTitle>Timeline & Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {proposal.timeline}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposal.proposalItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.rate.toLocaleString()}
                        </p>
                      </div>
                      <div className="font-semibold text-lg">
                        ${item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold">Total Investment:</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <span className="text-3xl font-bold text-green-600">
                          {proposal.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            {proposal.terms && (
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {proposal.terms}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            {!isExpired && ['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ready to Move Forward?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ClientProposalActions 
                    proposalId={proposal.id} 
                    token={params.token}
                    status={proposal.status}
                  />
                </CardContent>
              </Card>
            )}

            {proposal.status === 'ACCEPTED' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-600">Proposal Accepted!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Thank you for accepting our proposal. We'll be in touch soon to finalize the contract details.
                  </p>
                  {proposal.acceptedAt && (
                    <p className="text-xs text-muted-foreground">
                      Accepted on {new Date(proposal.acceptedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {proposal.status === 'REJECTED' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Proposal Declined</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This proposal has been declined.
                  </p>
                  {proposal.rejectedAt && (
                    <p className="text-xs text-muted-foreground">
                      Declined on {new Date(proposal.rejectedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{proposal.user.name}</p>
                  {proposal.user.email && (
                    <p className="text-sm text-muted-foreground">{proposal.user.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Proposal Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Proposal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Created:</span>
                  <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                </div>
                
                {proposal.sentAt && (
                  <div className="flex justify-between text-sm">
                    <span>Sent:</span>
                    <span>{new Date(proposal.sentAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                {proposal.viewedAt && (
                  <div className="flex justify-between text-sm">
                    <span>First Viewed:</span>
                    <span>{new Date(proposal.viewedAt).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Valid Until:</span>
                  <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                    {new Date(proposal.validUntil).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Line Items:</span>
                  <span>{proposal.proposalItems.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Download/Print */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Print Proposal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}