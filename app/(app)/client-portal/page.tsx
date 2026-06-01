'use client';

/**
 * Client Portal Dashboard
 * 
 * Client-facing portal for viewing job requisitions, candidate pipeline,
 * and providing feedback on candidates.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRequisitions: number;
  openRequisitions: number;
  filledRequisitions: number;
  totalCandidates: number;
  pendingFeedback: number;
  interviewsScheduled: number;
}

interface Requisition {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: string;
  priority: string;
  numberOfPositions: number;
  positionsFilled: number;
  createdAt: string;
  targetFillDate: string | null;
  candidateStats: {
    total: number;
    pending: number;
    interested: number;
    interviewing: number;
    rejected: number;
  };
}

interface ClientPortalData {
  client: {
    id: string;
    name: string;
  };
  requisitions: Requisition[];
  stats: DashboardStats;
}

export default function ClientPortalPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<ClientPortalData | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPortalData() {
      try {
        setLoading(true);
        setError(null);

        // If token provided, verify access first
        if (token) {
          const verifyResponse = await fetch(
            `/api/recruiting/client-portal?action=verify_access&shareToken=${token}`
          );
          
          if (!verifyResponse.ok) {
            throw new Error('Invalid or expired access token');
          }
          
          const { clientId: verifiedClientId } = await verifyResponse.json();
          setClientId(verifiedClientId);
          
          // Load dashboard data
          const dashboardResponse = await fetch(
            `/api/recruiting/client-portal?action=dashboard&clientId=${verifiedClientId}`
          );
          
          if (!dashboardResponse.ok) {
            throw new Error('Failed to load portal data');
          }
          
          const data = await dashboardResponse.json();
          setPortalData(data);
        } else {
          setError('Access token required. Please use the link provided by your recruiter.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portal');
      } finally {
        setLoading(false);
      }
    }

    loadPortalData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!portalData) {
    return null;
  }

  const { client, requisitions, stats } = portalData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-500 dark:bg-green-500/20';
      case 'on-hold':
        return 'bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20';
      case 'filled':
        return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 dark:bg-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20';
      case 'medium':
        return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20';
      case 'low':
        return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recruiting Portal</h1>
              <p className="text-muted-foreground mt-1">Welcome, {client.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Need help?</p>
              <p className="text-sm font-medium text-foreground">Contact your recruiter</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.openRequisitions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRequisitions} total requisitions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidates in Pipeline</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">
                Across all open positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Your Feedback</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.pendingFeedback}</div>
              <p className="text-xs text-muted-foreground">
                {stats.interviewsScheduled} interviews scheduled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requisitions Tabs */}
        <Tabs defaultValue="open" className="space-y-6">
          <TabsList>
            <TabsTrigger value="open">
              Open Positions ({stats.openRequisitions})
            </TabsTrigger>
            <TabsTrigger value="filled">
              Filled ({stats.filledRequisitions})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Requisitions ({stats.totalRequisitions})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-4">
            {requisitions.filter((r) => r.status === 'open').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No open positions at this time.</p>
                </CardContent>
              </Card>
            ) : (
              requisitions
                .filter((r) => r.status === 'open')
                .map((req) => (
                  <RequisitionCard
                    key={req.id}
                    requisition={req}
                    clientId={clientId!}
                    token={token!}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="filled" className="space-y-4">
            {requisitions.filter((r) => r.status === 'filled').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No filled positions yet.</p>
                </CardContent>
              </Card>
            ) : (
              requisitions
                .filter((r) => r.status === 'filled')
                .map((req) => (
                  <RequisitionCard
                    key={req.id}
                    requisition={req}
                    clientId={clientId!}
                    token={token!}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {requisitions.map((req) => (
              <RequisitionCard
                key={req.id}
                requisition={req}
                clientId={clientId!}
                token={token!}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RequisitionCard({
  requisition,
  clientId,
  token,
  getStatusColor,
  getPriorityColor,
}: {
  requisition: Requisition;
  clientId: string;
  token: string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-foreground">{requisition.title}</CardTitle>
              <Badge className={getStatusColor(requisition.status)}>
                {requisition.status}
              </Badge>
              <Badge className={getPriorityColor(requisition.priority)}>
                {requisition.priority}
              </Badge>
            </div>
            <CardDescription>
              {requisition.department && `${requisition.department} • `}
              {requisition.location || 'Remote'}
              {' • '}
              {requisition.numberOfPositions} {requisition.numberOfPositions === 1 ? 'position' : 'positions'}
              {requisition.positionsFilled > 0 && ` (${requisition.positionsFilled} filled)`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Candidates</p>
            <p className="text-2xl font-bold text-foreground">{requisition.candidateStats.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-500">{requisition.candidateStats.pending}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interested</p>
            <p className="text-2xl font-bold text-green-500">{requisition.candidateStats.interested}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Interviewing</p>
            <p className="text-2xl font-bold text-blue-500">{requisition.candidateStats.interviewing}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/client-portal/requisition/${requisition.id}?token=${token}&clientId=${clientId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Candidates
            </Link>
          </Button>
          {requisition.candidateStats.pending > 0 && (
            <Button variant="outline" asChild>
              <Link href={`/client-portal/requisition/${requisition.id}?token=${token}&clientId=${clientId}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Provide Feedback ({requisition.candidateStats.pending})
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
