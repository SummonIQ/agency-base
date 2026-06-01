import { auth } from '@/lib/auth/server';
import { getContract } from '@/lib/contracts';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Building2,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Receipt,
  AlertTriangle,
  Signature,
  Download,
  Share
} from 'lucide-react';
import ContractActions from '@/components/contracts/contract-actions';

interface ContractDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const contract = await getContract(params.id, session.user.id);

  if (!contract) {
    notFound();
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    NEGOTIATING: 'bg-yellow-100 text-yellow-800',
    SIGNED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-slate-100 text-slate-800',
    TERMINATED: 'bg-red-100 text-red-800',
  };

  const isExpiring = contract.endDate && 
    new Date(contract.endDate).getTime() - new Date().getTime() < (30 * 24 * 60 * 60 * 1000) &&
    contract.status === 'ACTIVE';
  
  const daysUntilExpiry = contract.endDate 
    ? Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const signatureStatus = {
    agencySigned: !!contract.signedByAgencyAt,
    clientSigned: !!contract.signedByClientAt,
    bothSigned: !!contract.signedByAgencyAt && !!contract.signedByClientAt,
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contracts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contracts
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{contract.title}</h1>
              <Badge className={statusColors[contract.status]}>
                {contract.status}
              </Badge>
              {isExpiring && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Expires in {daysUntilExpiry} days
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {contract.client.name}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {contract.contractNumber}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(contract.startDate).toLocaleDateString()}
                {contract.endDate && ` - ${new Date(contract.endDate).toLocaleDateString()}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <ContractActions contract={contract} userId={session.user.id} />
          
          <Link href={`/contracts/${contract.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Contract Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contract Number</p>
                  <p className="font-medium">{contract.contractNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600 text-lg">
                      {contract.totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</p>
                </div>
                {contract.endDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(contract.endDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scope of Work */}
          {contract.scope && (
            <Card>
              <CardHeader>
                <CardTitle>Scope of Work</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {contract.scope}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Conditions */}
          {contract.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {contract.terms}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Schedule */}
          {contract.paymentSchedule && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {/* This would be rendered based on the paymentSchedule JSON structure */}
                  <p className="text-muted-foreground">Payment terms as specified in contract</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Signature Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Signature Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Agency Signature:</span>
                  <div className="flex items-center gap-2">
                    {signatureStatus.agencySigned ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Signed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                
                {contract.agencySignatureName && (
                  <div className="text-xs text-muted-foreground ml-4">
                    Signed by: {contract.agencySignatureName}
                    <br />
                    {contract.signedByAgencyAt && 
                      `On: ${new Date(contract.signedByAgencyAt).toLocaleDateString()}`
                    }
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Client Signature:</span>
                  <div className="flex items-center gap-2">
                    {signatureStatus.clientSigned ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Signed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-600">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                
                {contract.clientSignatureName && (
                  <div className="text-xs text-muted-foreground ml-4">
                    Signed by: {contract.clientSignatureName}
                    <br />
                    {contract.signedByClientAt && 
                      `On: ${new Date(contract.signedByClientAt).toLocaleDateString()}`
                    }
                  </div>
                )}
              </div>
              
              {signatureStatus.bothSigned && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Fully Executed</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Records */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Related Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/clients/${contract.client.id}`}>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  View Client
                </Button>
              </Link>
              
              {contract.proposal && (
                <Link href={`/proposals/${contract.proposal.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View Original Proposal
                  </Button>
                </Link>
              )}
              
              {contract.projects.length > 0 && (
                <Link href={`/projects?contract=${contract.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    View Projects ({contract.projects.length})
                  </Button>
                </Link>
              )}
              
              {contract.invoices.length > 0 && (
                <Link href={`/invoices?contract=${contract.id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Receipt className="mr-2 h-4 w-4" />
                    View Invoices ({contract.invoices.length})
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Contract Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share className="mr-2 h-4 w-4" />
                Share with Client
              </Button>
              
              {contract.status === 'ACTIVE' && contract.endDate && (
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Renew Contract
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}