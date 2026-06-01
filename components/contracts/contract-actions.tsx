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
import { Label } from '@/components/ui/label';
import { 
  Signature,
  Send,
  FileText,
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react';

interface ContractActionsProps {
  contract: any;
  userId: string;
}

export default function ContractActions({ contract, userId }: ContractActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAgencySignDialog, setShowAgencySignDialog] = useState(false);
  const [showClientSignDialog, setShowClientSignDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [agencySignatureName, setAgencySignatureName] = useState('');
  const [clientSignatureName, setClientSignatureName] = useState('');
  const [renewalEndDate, setRenewalEndDate] = useState('');
  const [renewalValue, setRenewalValue] = useState(contract.totalValue);

  const signatureStatus = {
    agencySigned: !!contract.signedByAgencyAt,
    clientSigned: !!contract.signedByClientAt,
    bothSigned: !!contract.signedByAgencyAt && !!contract.signedByClientAt,
  };

  const handleAgencySign = async () => {
    if (!agencySignatureName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedByAgency: true,
          agencySignatureName: agencySignatureName.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign contract');
      }
      
      setShowAgencySignDialog(false);
      setAgencySignatureName('');
      router.refresh();
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Failed to sign contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSign = async () => {
    if (!clientSignatureName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedByClient: true,
          clientSignatureName: clientSignatureName.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign contract');
      }
      
      setShowClientSignDialog(false);
      setClientSignatureName('');
      router.refresh();
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Failed to sign contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToClient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/send`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to send contract');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error sending contract:', error);
      alert('Failed to send contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewContract = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endDate: new Date(renewalEndDate),
          totalValue: renewalValue,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to renew contract');
      }
      
      const newContract = await response.json();
      setShowRenewalDialog(false);
      router.push(`/contracts/${newContract.id}`);
    } catch (error) {
      console.error('Error renewing contract:', error);
      alert('Failed to renew contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Send to Client */}
      {contract.status === 'DRAFT' && (
        <Button onClick={handleSendToClient} disabled={isLoading}>
          <Send className="mr-2 h-4 w-4" />
          Send to Client
        </Button>
      )}

      {/* Agency Signature */}
      {['DRAFT', 'SENT', 'NEGOTIATING'].includes(contract.status) && !signatureStatus.agencySigned && (
        <Dialog open={showAgencySignDialog} onOpenChange={setShowAgencySignDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Signature className="mr-2 h-4 w-4" />
              Sign as Agency
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agency Signature</DialogTitle>
              <DialogDescription>
                Sign this contract on behalf of your agency.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agencySignature">Your Full Name</Label>
                <Input
                  id="agencySignature"
                  value={agencySignatureName}
                  onChange={(e) => setAgencySignatureName(e.target.value)}
                  placeholder="Enter your full legal name"
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground">
                By signing, you confirm that you have the authority to bind your agency 
                to this contract and agree to all terms and conditions.
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAgencySignDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAgencySign}
                disabled={isLoading || !agencySignatureName.trim()}
              >
                <Signature className="mr-2 h-4 w-4" />
                Sign Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Signature (for internal tracking) */}
      {['SENT', 'NEGOTIATING'].includes(contract.status) && !signatureStatus.clientSigned && (
        <Dialog open={showClientSignDialog} onOpenChange={setShowClientSignDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Client Signed
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Client Signature Received</DialogTitle>
              <DialogDescription>
                Record that the client has signed this contract.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientSignature">Client Signatory Name</Label>
                <Input
                  id="clientSignature"
                  value={clientSignatureName}
                  onChange={(e) => setClientSignatureName(e.target.value)}
                  placeholder="Enter client's full legal name"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowClientSignDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleClientSign}
                disabled={isLoading || !clientSignatureName.trim()}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Signed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Renew Contract */}
      {contract.status === 'ACTIVE' && contract.endDate && (
        <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Renew Contract
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renew Contract</DialogTitle>
              <DialogDescription>
                Create a renewal contract with updated terms.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="renewalEndDate">New End Date</Label>
                <Input
                  id="renewalEndDate"
                  type="date"
                  value={renewalEndDate}
                  onChange={(e) => setRenewalEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="renewalValue">Contract Value</Label>
                <Input
                  id="renewalValue"
                  type="number"
                  value={renewalValue}
                  onChange={(e) => setRenewalValue(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowRenewalDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRenewContract}
                disabled={isLoading || !renewalEndDate}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Renewal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}