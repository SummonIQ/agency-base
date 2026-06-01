'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  FileText,
  Building2,
  Target,
  Calendar,
  Calculator
} from 'lucide-react';
import Link from 'next/link';

interface ProposalItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface Lead {
  id: string;
  title: string;
  companyName?: string;
  estimatedValue?: number;
}

interface ProposalFormProps {
  clients: Client[];
  leads: Lead[];
  userId: string;
  initialData?: any;
  isEditing?: boolean;
}

export default function ProposalForm({ 
  clients, 
  leads, 
  userId, 
  initialData, 
  isEditing = false 
}: ProposalFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [leadId, setLeadId] = useState(initialData?.leadId || '');
  const [executiveSummary, setExecutiveSummary] = useState(initialData?.executiveSummary || '');
  const [scope, setScope] = useState(initialData?.scope || '');
  const [timeline, setTimeline] = useState(initialData?.timeline || '');
  const [terms, setTerms] = useState(initialData?.terms || '');
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil 
      ? new Date(initialData.validUntil).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  );
  
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>(
    initialData?.proposalItems || [
      { description: '', quantity: 1, rate: 0, amount: 0 }
    ]
  );

  const addProposalItem = () => {
    setProposalItems([...proposalItems, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeProposalItem = (index: number) => {
    setProposalItems(proposalItems.filter((_, i) => i !== index));
  };

  const updateProposalItem = (index: number, field: keyof ProposalItem, value: string | number) => {
    const updatedItems = [...proposalItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setProposalItems(updatedItems);
  };

  const totalAmount = proposalItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent, asDraft = true) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const proposalData = {
        title,
        clientId: clientId || undefined,
        leadId: leadId || undefined,
        executiveSummary,
        scope,
        timeline,
        terms,
        totalAmount,
        validUntil: new Date(validUntil),
        status: asDraft ? 'DRAFT' : 'SENT',
        proposalItems: proposalItems.filter(item => item.description.trim()),
      };

      const response = await fetch('/api/proposals', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: initialData.id, ...proposalData } : proposalData),
      });

      if (!response.ok) {
        throw new Error('Failed to save proposal');
      }

      const proposal = await response.json();
      router.push(`/proposals/${proposal.id}`);
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('Failed to save proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedClient = clients.find(c => c.id === clientId);
  const selectedLead = leads.find(l => l.id === leadId);

  return (
    <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/proposals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button 
            type="button" 
            onClick={(e) => handleSubmit(e, false)}
            disabled={isLoading}
          >
            Send Proposal
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details for your proposal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Proposal Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Website Redesign Project"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {client.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lead">Related Lead (Optional)</Label>
                  <Select value={leadId} onValueChange={setLeadId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            {lead.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>
                Provide a high-level overview of the project and your approach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Summarize the project goals, your approach, and key benefits..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Scope of Work */}
          <Card>
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
              <CardDescription>
                Detail what work will be performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="Describe the specific work to be performed, deliverables, and any exclusions..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Deliverables</CardTitle>
              <CardDescription>
                Outline the project timeline and key milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="Describe the project phases, milestones, and expected completion dates..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
              <CardDescription>
                Specify payment terms, cancellation policy, and other conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Include payment terms, intellectual property rights, cancellation policy..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Client/Lead Info */}
          {(selectedClient || selectedLead) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {selectedClient ? 'Client Information' : 'Lead Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedClient && (
                  <>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{selectedClient.name}</span>
                    </div>
                    {selectedClient.email && (
                      <div className="text-sm text-muted-foreground">
                        {selectedClient.email}
                      </div>
                    )}
                  </>
                )}
                {selectedLead && (
                  <>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">{selectedLead.title}</span>
                    </div>
                    {selectedLead.companyName && (
                      <div className="text-sm text-muted-foreground">
                        {selectedLead.companyName}
                      </div>
                    )}
                    {selectedLead.estimatedValue && (
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-3 w-3" />
                        <span>${selectedLead.estimatedValue.toLocaleString()} estimated</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Add line items for services and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposalItems.map((item, index) => (
                <div key={index} className="space-y-3 p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {proposalItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProposalItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateProposalItem(index, 'description', e.target.value)}
                      placeholder="Service description"
                    />
                  </div>
                  
                  <div className="grid gap-2 grid-cols-3">
                    <div>
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateProposalItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateProposalItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <div className="flex items-center gap-1 mt-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addProposalItem}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Line Item
              </Button>
              
              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-xl font-bold text-green-600">
                      {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const template = `## Project Overview
[Brief description of the project]

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

## Timeline
- **Week 1-2:** Planning and design
- **Week 3-4:** Development
- **Week 5:** Testing and deployment

## Success Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]`;
                  setScope(template);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Use Scope Template
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const template = `## Payment Terms
- 50% upfront payment upon contract signing
- 50% upon project completion and client approval

## Intellectual Property
All work product will be owned by the client upon final payment.

## Revision Policy
Up to 2 rounds of revisions included. Additional revisions billed at $150/hour.

## Cancellation Policy
Either party may cancel with 30 days written notice. Client responsible for work completed.`;
                  setTerms(template);
                }}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Use Terms Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}