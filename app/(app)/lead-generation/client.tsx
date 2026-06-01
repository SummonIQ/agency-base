'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { OutreachEmailDialog } from '@/components/lead-generation/outreach-email-dialog';
import { NewLeadModal } from '@/components/lead-generation/new-lead-modal';
import {
  Search,
  Users,
  Mail,
  TrendingUp,
  Target,
  Zap,
  Building,
  Linkedin,
  ExternalLink,
  Plus,
  Loader2,
  BarChart3,
  Database,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

interface AgencyLead {
  id: string;
  title: string;
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  status: string;
  estimatedValue?: number;
  probability?: number;
  createdAt: string;
}

interface LeadAnalytics {
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  conversionRate: number;
  averageDealSize: number;
}

export default function LeadGenerationClient() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<AgencyLead[]>([]);
  const [analytics, setAnalytics] = useState<LeadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<AgencyLead | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchLeads(),
      fetchAnalytics()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/lead-generation/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // This would be a separate analytics endpoint
      // For now, calculate from leads data
      setAnalytics({
        totalLeads: leads.length,
        leadsByStatus: {},
        leadsBySource: {},
        conversionRate: 18.2,
        averageDealSize: 75000
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const statusColors = {
    NEW: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
    CONTACTED: 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200',
    QUALIFIED: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200',
    PROPOSAL_SENT: 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200',
    NEGOTIATING: 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200',
    NURTURING: 'bg-gray-100 dark:bg-gray-950/50 text-gray-800 dark:text-gray-200',
    WON: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200',
    LOST: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200'
  };

  const handleEmailLead = (lead: AgencyLead) => {
    setSelectedLead(lead);
    setShowEmailDialog(true);
  };

  const handleEmailSent = () => {
    // Refresh leads to update status
    fetchLeads();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Generation</h1>
          <p className="text-muted-foreground">Discover, enrich, and convert prospects</p>
        </div>
        <div className="flex gap-2">
          <Link href="/lead-generation/analytics">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/lead-generation/linkedin">
            <Button variant="outline">
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
          </Link>
          <Link href="/lead-generation/ab-testing">
            <Button variant="outline">
              <TestTube className="mr-2 h-4 w-4" />
              A/B Testing
            </Button>
          </Link>
          <Link href="/lead-generation/import-export">
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Import/Export
            </Button>
          </Link>
          <Link href="/lead-generation/search">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Find Prospects
            </Button>
          </Link>
          <Button onClick={() => setShowNewLeadModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
          <Link href="/lead-generation/campaigns">
            <Button variant="outline">
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.2%</div>
            <p className="text-xs text-muted-foreground">Industry average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Pipeline</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${leads.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total potential value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prospects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-4">
          {leads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No prospects yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Start by searching for potential clients that match your criteria
                </p>
                <Button onClick={() => setShowNewLeadModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lead Manually
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {lead.companyName || 'Unknown Company'}
                          <Badge className={statusColors[lead.status as keyof typeof statusColors] || statusColors.NEW}>
                            {lead.status}
                          </Badge>
                          {lead.probability && (
                            <Badge variant="outline" className="ml-2">
                              {lead.probability}% likely
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {lead.title}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEmailLead(lead)}
                          disabled={!lead.contactEmail}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline">
                          <Linkedin className="h-3 w-3 mr-1" />
                          LinkedIn
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      {lead.contactName && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{lead.contactName}</span>
                          </div>
                          {lead.contactEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{lead.contactEmail}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {lead.estimatedValue && (
                          <span>Estimated value: ${lead.estimatedValue.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          Add to Campaign
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Campaign Management</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create automated email sequences to nurture your leads
              </p>
              <Link href="/lead-generation/campaigns">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Tech Startup Introduction
                </CardTitle>
                <CardDescription>
                  Initial outreach to tech startups • 12.5% conversion rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Subject:</strong> Quick question about {'{{companyName}}'} development roadmap
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hi {'{{firstName}}'}, I noticed {'{{companyName}}'} is using {'{{techStack}}'} for your platform...
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                    <Button size="sm">Use Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Connection Request
                </CardTitle>
                <CardDescription>
                  LinkedIn connection request • 35% acceptance rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Hi {'{{firstName}}'}, I noticed we&apos;re both in the {'{{industry}}'} space. I&apos;d love to connect...
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                    <Button size="sm">Use Template</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Lead Modal */}
      <NewLeadModal
        open={showNewLeadModal}
        onOpenChange={setShowNewLeadModal}
      />

      {/* Email Dialog */}
      {selectedLead && (
        <OutreachEmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          lead={{
            id: selectedLead.id,
            companyName: selectedLead.companyName || 'Unknown Company',
            contactName: selectedLead.contactName,
            contactEmail: selectedLead.contactEmail
          }}
          onEmailSent={handleEmailSent}
        />
      )}
    </div>
  );
}