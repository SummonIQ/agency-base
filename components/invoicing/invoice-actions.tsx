'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Send,
  Download,
  Copy,
  Eye,
  DollarSign,
  Mail,
  Share
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  issueDate: Date;
  dueDate: Date;
  client: {
    name: string;
  };
  project?: {
    name: string;
  };
}

interface InvoiceActionsProps {
  invoice: Invoice;
  userId: string;
}

export default function InvoiceActions({
  invoice,
  userId,
}: InvoiceActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleView = () => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleEdit = () => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      toast.success('Invoice sent successfully');
      router.refresh();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate invoice');
      }

      const newInvoice = await response.json();
      toast.success('Invoice duplicated successfully');
      router.push(`/invoices/${newInvoice.id}/edit`);
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast.error('Failed to duplicate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/share`);

      if (!response.ok) {
        throw new Error('Failed to get share link');
      }

      const { shareUrl } = await response.json();
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      console.error('Error sharing invoice:', error);
      toast.error('Failed to get share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = () => {
    router.push(`/invoices/${invoice.id}/payment`);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      toast.success('Invoice deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const canEdit = invoice.status === 'DRAFT';
  const canSend = invoice.status === 'DRAFT';
  const canDelete = invoice.status === 'DRAFT';
  const canAddPayment = invoice.status === 'SENT' || invoice.status === 'VIEWED';

  return (
    <>
      <div className="flex gap-1">
        {canSend && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSend}
            disabled={isLoading}
            className="text-xs"
          >
            <Send className="h-3 w-3 mr-1" />
            Send
          </Button>
        )}
        
        {canAddPayment && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddPayment}
            disabled={isLoading}
            className="text-xs"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Payment
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={handleEdit} disabled={isLoading}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDuplicate} disabled={isLoading}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownloadPDF} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} disabled={isLoading}>
              <Share className="mr-2 h-4 w-4" />
              Share Link
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => window.open(`mailto:?subject=Invoice ${invoice.invoiceNumber}&body=Please find attached invoice ${invoice.invoiceNumber}`)}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email Client
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canDelete && (
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
              <div className="mt-2 p-2 bg-muted rounded">
                <strong>{invoice.invoiceNumber}</strong><br />
                {invoice.client.name} • ${invoice.totalAmount.toLocaleString()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}