import { auth } from '@/lib/auth/server';
import { getContracts, getContractStats } from '@/lib/contracts';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Plus, 
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  Users,
  Receipt
} from 'lucide-react';

export default async function ContractsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [contracts, stats] = await Promise.all([
    getContracts(session.user.id),
    getContractStats(session.user.id),
  ]);

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SENT: 'bg-blue-100 text-blue-800',
    NEGOTIATING: 'bg-yellow-100 text-yellow-800',
    SIGNED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    COMPLETED: 'bg-slate-100 text-slate-800',
    TERMINATED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Manage your client contracts and agreements</p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.signedContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="grid gap-4">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No contracts yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first contract to formalize client agreements
              </p>
              <Link href="/contracts/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Contract
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => {
            const isExpiring = contract.endDate && 
              new Date(contract.endDate).getTime() - new Date().getTime() < (30 * 24 * 60 * 60 * 1000) &&
              contract.status === 'ACTIVE';
            const daysUntilExpiry = contract.endDate 
              ? Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Link 
                          href={`/contracts/${contract.id}`}
                          className="hover:underline"
                        >
                          {contract.title}
                        </Link>
                        <Badge className={statusColors[contract.status]}>
                          {contract.status}
                        </Badge>
                        {isExpiring && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Expiring Soon
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {contract.client.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {contract.contractNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started {new Date(contract.startDate).toLocaleDateString()}
                          </span>
                          {contract.endDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Ends {new Date(contract.endDate).toLocaleDateString()}
                              {daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
                                <span className="text-orange-600 font-medium">
                                  ({daysUntilExpiry} days)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-green-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-lg">
                          ${contract.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {contract.signedByAgencyAt && (
                          <span>✓ Agency</span>
                        )}
                        {contract.signedByClientAt && (
                          <span>✓ Client</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {contract.proposal && (
                        <Badge variant="outline">
                          From Proposal: {contract.proposal.title}
                        </Badge>
                      )}
                      {contract._count.projects > 0 && (
                        <Badge variant="outline">
                          {contract._count.projects} project{contract._count.projects !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {contract._count.invoices > 0 && (
                        <Badge variant="outline">
                          {contract._count.invoices} invoice{contract._count.invoices !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {contract._count.projects > 0 && (
                        <Link href={`/projects?contract=${contract.id}`}>
                          <Button variant="outline" size="sm">
                            <Users className="mr-1 h-3 w-3" />
                            Projects
                          </Button>
                        </Link>
                      )}
                      {contract._count.invoices > 0 && (
                        <Link href={`/invoices?contract=${contract.id}`}>
                          <Button variant="outline" size="sm">
                            <Receipt className="mr-1 h-3 w-3" />
                            Invoices
                          </Button>
                        </Link>
                      )}
                      <Link href={`/contracts/${contract.id}`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}