'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  Share,
  Check
} from 'lucide-react';

interface ProposalActionsProps {
  proposal: any;
  userId: string;
}

export default function ProposalActions({ proposal, userId }: ProposalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);

  const handleSendProposal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/send`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send proposal');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('Failed to send proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept proposal');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectProposal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject proposal');
      }
      
      setShowRejectDialog(false);
      setRejectionReason('');
      router.refresh();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContract = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/contract`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create contract');
      }
      
      const contract = await response.json();
      router.push(`/contracts/${contract.id}`);
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to create contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateProposal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/duplicate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate proposal');
      }
      
      const newProposal = await response.json();
      router.push(`/proposals/${newProposal.id}/edit`);
    } catch (error) {
      console.error('Error duplicating proposal:', error);
      alert('Failed to duplicate proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/shared/proposal/${proposal.shareToken}`;
    }
    return `http://localhost:3030/shared/proposal/${proposal.shareToken}`;
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setShareUrlCopied(true);
      setTimeout(() => setShareUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      const input = document.createElement('input');
      input.value = getShareUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareUrlCopied(true);
      setTimeout(() => setShareUrlCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Send Proposal */}
      {proposal.status === 'DRAFT' && (
        <Button onClick={handleSendProposal} disabled={isLoading}>
          <Send className="mr-2 h-4 w-4" />
          Send to Client
        </Button>
      )}

      {/* Accept Proposal */}
      {['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status) && (
        <Button onClick={handleAcceptProposal} disabled={isLoading}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark Accepted
        </Button>
      )}

      {/* Reject Proposal */}
      {['SENT', 'VIEWED', 'NEGOTIATING'].includes(proposal.status) && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <XCircle className="mr-2 h-4 w-4" />
              Mark Rejected
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Proposal</DialogTitle>
              <DialogDescription>
                Mark this proposal as rejected. You can optionally include a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Why was this proposal rejected?"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowRejectDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectProposal}
                disabled={isLoading}
              >
                Mark as Rejected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Contract */}
      {proposal.status === 'ACCEPTED' && !proposal.contract && (
        <Button onClick={handleCreateContract} disabled={isLoading}>
          <FileText className="mr-2 h-4 w-4" />
          Create Contract
        </Button>
      )}

      {/* Share Proposal */}
      {proposal.shareToken && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Proposal</DialogTitle>
              <DialogDescription>
                Share this proposal with your client using the secure link below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shareUrl">Proposal Share URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="shareUrl"
                    value={getShareUrl()}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyShareUrl}
                    className="shrink-0"
                  >
                    {shareUrlCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>This secure link allows your client to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>View the complete proposal</li>
                  <li>Accept or decline the proposal</li>
                  <li>Provide feedback or request changes</li>
                  <li>Download a PDF copy</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowShareDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Duplicate */}
      <Button variant="outline" onClick={handleDuplicateProposal} disabled={isLoading}>
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </Button>
    </>
  );
}