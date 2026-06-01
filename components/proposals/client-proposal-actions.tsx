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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle,
  XCircle,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ClientProposalActionsProps {
  proposalId: string;
  token: string;
  status: string;
}

export default function ClientProposalActions({ 
  proposalId, 
  token, 
  status 
}: ClientProposalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shared/proposal/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept proposal');
      }
      
      setShowAcceptDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shared/proposal/${token}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: feedback }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject proposal');
      }
      
      setShowRejectDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNegotiate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shared/proposal/${token}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start negotiation');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error starting negotiation:', error);
      alert('Failed to start negotiation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Accept Proposal */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Accept Proposal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Proposal</DialogTitle>
            <DialogDescription>
              You're about to accept this proposal. Any additional feedback or questions?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accept-feedback">Additional Comments (Optional)</Label>
              <Textarea
                id="accept-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any additional comments or questions..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAcceptDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={isLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiate */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <MessageCircle className="mr-2 h-4 w-4" />
            Request Changes
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Let us know what you'd like to discuss or modify in this proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="negotiate-feedback">Your Feedback</Label>
              <Textarea
                id="negotiate-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please describe what you'd like to change or discuss..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFeedback('')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleNegotiate}
              disabled={isLoading || !feedback.trim()}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Proposal */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <ThumbsDown className="mr-2 h-4 w-4" />
            Decline Proposal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Proposal</DialogTitle>
            <DialogDescription>
              We appreciate you taking the time to review our proposal. 
              Optional: Let us know how we can improve for future opportunities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-feedback">Feedback (Optional)</Label>
              <Textarea
                id="reject-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Any feedback on why this proposal isn't a fit..."
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
              onClick={handleReject}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}