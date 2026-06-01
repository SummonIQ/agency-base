'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Users, 
  Mail, 
  MessageCircle, 
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { AutomationStatus, AutomationTrigger } from '@prisma/client';
import { SequenceBuilder } from '@/components/automation/sequence-builder';

interface AutomationSequence {
  id: string;
  name: string;
  description?: string;
  type: 'EMAIL' | 'LINKEDIN' | 'MIXED';
  trigger: AutomationTrigger;
  status: AutomationStatus;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  pausedAt?: string;
  _count: {
    recipients: number;
    steps: number;
  };
}

interface SequencePerformance {
  sequenceId: string;
  totalRecipients: number;
  activeRecipients: number;
  completedRecipients: number;
  unsubscribedRecipients: number;
  bouncedRecipients: number;
  overallStats: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    unsubscribeRate: number;
    conversionRate: number;
  };
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

const TYPE_ICONS = {
  EMAIL: Mail,
  LINKEDIN: MessageCircle,
  MIXED: Zap,
};

export default function AutomationSequencesPage() {
  const [sequences, setSequences] = useState<AutomationSequence[]>([]);
  const [performance, setPerformance] = useState<Record<string, SequencePerformance>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSequence, setEditingSequence] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'EMAIL' | 'LINKEDIN' | 'MIXED' | 'ALL'>('ALL');

  useEffect(() => {
    fetchSequences();
  }, [statusFilter, typeFilter]);

  const fetchSequences = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await fetch(`/api/automation/sequences?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSequences(data.sequences);
        
        // Fetch performance data for active sequences
        const activeSequences = data.sequences.filter((s: AutomationSequence) => s.status === 'ACTIVE');
        for (const sequence of activeSequences) {
          fetchSequencePerformance(sequence.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sequences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSequencePerformance = async (sequenceId: string) => {
    try {
      const response = await fetch('/api/automation/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_performance',
          data: { sequenceId },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPerformance(prev => ({
          ...prev,
          [sequenceId]: data.performance,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const updateSequenceStatus = async (sequenceId: string, status: AutomationStatus) => {
    try {
      const response = await fetch('/api/automation/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          data: { sequenceId, status },
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchSequences();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteSequence = async (sequenceId: string) => {
    if (!confirm('Are you sure you want to delete this sequence? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/automation/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_sequence',
          data: { sequenceId },
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchSequences();
      }
    } catch (error) {
      console.error('Failed to delete sequence:', error);
    }
  };

  const processSequence = async (sequenceId: string) => {
    try {
      const response = await fetch('/api/automation/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_sequence',
          data: { sequenceId },
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Processed ${data.result.processed} recipients, sent ${data.result.sent} messages`);
        fetchSequences();
      }
    } catch (error) {
      console.error('Failed to process sequence:', error);
    }
  };

  const filteredSequences = sequences.filter(sequence => {
    const matchesSearch = sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sequence.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const SequenceCard = ({ sequence }: { sequence: AutomationSequence }) => {
    const TypeIcon = TYPE_ICONS[sequence.type];
    const sequencePerformance = performance[sequence.id];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TypeIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">{sequence.name}</CardTitle>
                {sequence.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {sequence.description}
                  </p>
                )}
              </div>
            </div>
            <Badge className={STATUS_COLORS[sequence.status]}>
              {sequence.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sequence Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-lg">{sequence._count.steps}</div>
              <div className="text-muted-foreground">Steps</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-lg">{sequence._count.recipients}</div>
              <div className="text-muted-foreground">Recipients</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-lg">
                {sequencePerformance?.overallStats.replyRate.toFixed(1) || '0'}%
              </div>
              <div className="text-muted-foreground">Reply Rate</div>
            </div>
          </div>

          {/* Performance Metrics (for active sequences) */}
          {sequence.status === 'ACTIVE' && sequencePerformance && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active:</span>
                <span>{sequencePerformance.activeRecipients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span>{sequencePerformance.completedRecipients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Rate:</span>
                <span>{sequencePerformance.overallStats.openRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Click Rate:</span>
                <span>{sequencePerformance.overallStats.clickRate.toFixed(1)}%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingSequence(sequence.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>

            {sequence.status === 'DRAFT' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSequenceStatus(sequence.id, 'ACTIVE')}
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}

            {sequence.status === 'ACTIVE' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSequenceStatus(sequence.id, 'PAUSED')}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => processSequence(sequence.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Process
                </Button>
              </>
            )}

            {sequence.status === 'PAUSED' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSequenceStatus(sequence.id, 'ACTIVE')}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteSequence(sequence.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showBuilder || editingSequence) {
    return (
      <SequenceBuilder
        sequenceId={editingSequence || undefined}
        onSave={() => {
          setShowBuilder(false);
          setEditingSequence(null);
          fetchSequences();
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingSequence(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation Sequences</h1>
          <p className="text-muted-foreground">
            Manage your email and LinkedIn automation sequences
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sequence
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sequences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: AutomationStatus | 'ALL') => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(value: 'EMAIL' | 'LINKEDIN' | 'MIXED' | 'ALL') => setTypeFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="EMAIL">Email Only</SelectItem>
            <SelectItem value="LINKEDIN">LinkedIn Only</SelectItem>
            <SelectItem value="MIXED">Multi-Channel</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchSequences}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sequences</p>
                <p className="text-2xl font-bold">{sequences.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {sequences.filter(s => s.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Users className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">
                  {sequences.reduce((sum, s) => sum + s._count.recipients, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Reply Rate</p>
                <p className="text-2xl font-bold">
                  {Object.values(performance).length > 0
                    ? (Object.values(performance).reduce((sum, p) => sum + p.overallStats.replyRate, 0) / Object.values(performance).length).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sequences Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSequences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sequences found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try adjusting your filters or search terms'
                : 'Create your first automation sequence to get started'
              }
            </p>
            {!searchTerm && statusFilter === 'ALL' && typeFilter === 'ALL' && (
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Sequence
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSequences.map((sequence) => (
            <SequenceCard key={sequence.id} sequence={sequence} />
          ))}
        </div>
      )}
    </div>
  );
}
