import { auth } from '@/lib/auth/server';
import { getInvoices, getInvoicingAnalytics } from '@/lib/invoicing';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Send
} from 'lucide-react';
import InvoiceActions from '@/components/invoicing/invoice-actions';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  VIEWED: 'bg-purple-100 text-purple-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

const statusIcons = {
  DRAFT: FileText,
  SENT: Send,
  VIEWED: Eye,
  PAID: CheckCircle,
  OVERDUE: AlertTriangle,
};

export default async function InvoicesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [invoices, analytics] = await Promise.all([
    getInvoices(session.user.id),
    getInvoicingAnalytics(session.user.id),
  ]);

  // Add overdue status for display
  const invoicesWithOverdue = invoices.map(invoice => ({
    ...invoice,
    displayStatus: invoice.status === 'SENT' || invoice.status === 'VIEWED'
      ? (new Date(invoice.dueDate) < new Date() ? 'OVERDUE' : invoice.status)
      : invoice.status
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage client invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/invoices/from-time">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              From Time Entries
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.paidInvoices} paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.summary.outstandingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary.overdueInvoices} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.collectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.summary.averageInvoiceValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per invoice
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Create from Time Entries</h3>
                <p className="text-sm text-muted-foreground">
                  Bill approved time entries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Manual Invoice</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom invoice
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Invoice Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Manage invoice templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Track and manage client invoices
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Send Reminders
              </Button>
              <Link href="/invoices/reports">
                <Button variant="outline" size="sm">
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first invoice to start billing clients
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/invoices/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </Link>
                <Link href="/invoices/from-time">
                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    From Time Entries
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {invoicesWithOverdue.slice(0, 10).map((invoice) => {
                const StatusIcon = statusIcons[invoice.displayStatus as keyof typeof statusIcons] || FileText;
                const isOverdue = invoice.displayStatus === 'OVERDUE';
                
                return (
                  <div key={invoice.id} className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${isOverdue ? 'border-red-200 bg-red-50/50' : ''}`}>
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className="font-medium truncate hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        <Badge className={statusColors[invoice.displayStatus as keyof typeof statusColors]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {invoice.displayStatus.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.client.name}
                        {invoice.project && ` • ${invoice.project.name}`}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        ${invoice.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm">
                        Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                      {invoice.paidAt && (
                        <div className="text-sm text-green-600">
                          Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <InvoiceActions 
                      invoice={invoice} 
                      userId={session.user.id}
                    />
                  </div>
                );
              })}
              
              {invoices.length > 10 && (
                <div className="text-center pt-4">
                  <Link href="/invoices/all">
                    <Button variant="outline">
                      View All Invoices ({invoices.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}