'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube2, 
  Target, 
  TrendingUp, 
  Users, 
  Mail,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Trophy
} from 'lucide-react';

export interface ABTest {
  id: string;
  name: string;
  type: 'subject' | 'content' | 'send_time' | 'from_name';
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  trafficSplit: number[];
  winnerCriteria: 'open_rate' | 'click_rate' | 'reply_rate' | 'conversion_rate';
  startDate: string;
  endDate?: string;
  sampleSize: number;
  confidenceLevel: number;
  results?: ABTestResults;
}

export interface ABTestVariant {
  id: string;
  name: string;
  subject?: string;
  content?: string;
  fromName?: string;
  sendTime?: string;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
  };
}

export interface ABTestResults {
  winner?: string;
  confidence: number;
  improvement: number;
  significant: boolean;
  summary: string;
}

interface ABTestingManagerProps {
  tests: ABTest[];
  onCreateTest: (test: Partial<ABTest>) => void;
  onUpdateTest: (testId: string, updates: Partial<ABTest>) => void;
  onDeleteTest: (testId: string) => void;
}

export function ABTestingManager({
  tests,
  onCreateTest,
  onUpdateTest,
  onDeleteTest
}: ABTestingManagerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'results'>('overview');
  const [newTest, setNewTest] = useState<Partial<ABTest>>({
    name: '',
    type: 'subject',
    variants: [
      { id: 'variant_a', name: 'Variant A', metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, converted: 0 } },
      { id: 'variant_b', name: 'Variant B', metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, converted: 0 } }
    ],
    trafficSplit: [50, 50],
    winnerCriteria: 'open_rate',
    sampleSize: 1000,
    confidenceLevel: 95,
    status: 'draft'
  });

  const runningTests = tests.filter(t => t.status === 'running');
  const completedTests = tests.filter(t => t.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'subject': return 'Subject Line';
      case 'content': return 'Email Content';
      case 'send_time': return 'Send Time';
      case 'from_name': return 'From Name';
      default: return type;
    }
  };

  const calculateMetric = (variant: ABTestVariant, criteria: string) => {
    const { metrics } = variant;
    switch (criteria) {
      case 'open_rate':
        return metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0;
      case 'click_rate':
        return metrics.delivered > 0 ? (metrics.clicked / metrics.delivered) * 100 : 0;
      case 'reply_rate':
        return metrics.delivered > 0 ? (metrics.replied / metrics.delivered) * 100 : 0;
      case 'conversion_rate':
        return metrics.delivered > 0 ? (metrics.converted / metrics.delivered) * 100 : 0;
      default:
        return 0;
    }
  };

  const handleCreateTest = () => {
    onCreateTest({
      ...newTest,
      id: `test_${Date.now()}`,
      startDate: new Date().toISOString()
    });
    setNewTest({
      name: '',
      type: 'subject',
      variants: [
        { id: 'variant_a', name: 'Variant A', metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, converted: 0 } },
        { id: 'variant_b', name: 'Variant B', metrics: { sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, converted: 0 } }
      ],
      trafficSplit: [50, 50],
      winnerCriteria: 'open_rate',
      sampleSize: 1000,
      confidenceLevel: 95,
      status: 'draft'
    });
    setActiveTab('overview');
  };

  if (activeTab === 'create') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create A/B Test</h2>
            <p className="text-gray-600">Set up a new A/B test to optimize your email campaigns</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setActiveTab('overview')}>
              Cancel
            </Button>
            <Button onClick={handleCreateTest}>
              Create Test
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Test Name</Label>
                <Input
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Subject Line Test - Tech Outreach"
                />
              </div>
              <div>
                <Label>Test Type</Label>
                <Select
                  value={newTest.type}
                  onValueChange={(value) => setNewTest(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subject">Subject Line</SelectItem>
                    <SelectItem value="content">Email Content</SelectItem>
                    <SelectItem value="send_time">Send Time</SelectItem>
                    <SelectItem value="from_name">From Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Winner Criteria</Label>
                <Select
                  value={newTest.winnerCriteria}
                  onValueChange={(value) => setNewTest(prev => ({ ...prev, winnerCriteria: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open_rate">Open Rate</SelectItem>
                    <SelectItem value="click_rate">Click Rate</SelectItem>
                    <SelectItem value="reply_rate">Reply Rate</SelectItem>
                    <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sample Size</Label>
                <Input
                  type="number"
                  value={newTest.sampleSize}
                  onChange={(e) => setNewTest(prev => ({ ...prev, sampleSize: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Confidence Level (%)</Label>
                <Input
                  type="number"
                  value={newTest.confidenceLevel}
                  onChange={(e) => setNewTest(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {newTest.variants?.map((variant, index) => (
              <div key={variant.id} className="border rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">{variant.name}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Traffic:</span>
                      <Input
                        type="number"
                        value={newTest.trafficSplit?.[index]}
                        onChange={(e) => {
                          const newSplit = [...(newTest.trafficSplit || [])];
                          newSplit[index] = parseInt(e.target.value);
                          setNewTest(prev => ({ ...prev, trafficSplit: newSplit }));
                        }}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>

                  {newTest.type === 'subject' && (
                    <div>
                      <Label>Subject Line</Label>
                      <Input
                        value={variant.subject || ''}
                        onChange={(e) => {
                          const newVariants = newTest.variants?.map(v => 
                            v.id === variant.id ? { ...v, subject: e.target.value } : v
                          );
                          setNewTest(prev => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="Enter subject line..."
                      />
                    </div>
                  )}

                  {newTest.type === 'from_name' && (
                    <div>
                      <Label>From Name</Label>
                      <Input
                        value={variant.fromName || ''}
                        onChange={(e) => {
                          const newVariants = newTest.variants?.map(v => 
                            v.id === variant.id ? { ...v, fromName: e.target.value } : v
                          );
                          setNewTest(prev => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="Enter from name..."
                      />
                    </div>
                  )}

                  {newTest.type === 'send_time' && (
                    <div>
                      <Label>Send Time</Label>
                      <Input
                        type="time"
                        value={variant.sendTime || ''}
                        onChange={(e) => {
                          const newVariants = newTest.variants?.map(v => 
                            v.id === variant.id ? { ...v, sendTime: e.target.value } : v
                          );
                          setNewTest(prev => ({ ...prev, variants: newVariants }));
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TestTube2 className="h-8 w-8 text-blue-600" />
            A/B Testing
          </h2>
          <p className="text-gray-600">Optimize your email campaigns with data-driven testing</p>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <TestTube2 className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TestTube2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Tests</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {tests.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Running</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {runningTests.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Completed</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {completedTests.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Avg Improvement</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {completedTests.length > 0 
                ? `${(completedTests.reduce((sum, test) => sum + (test.results?.improvement || 0), 0) / completedTests.length).toFixed(1)}%`
                : '0%'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tests */}
      {runningTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-6 w-6 text-green-600" />
              Running Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {runningTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{test.name}</h3>
                      <p className="text-sm text-gray-600">
                        {getTestTypeLabel(test.type)} • {test.sampleSize} recipients
                      </p>
                    </div>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map((variant, index) => (
                      <div key={variant.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-sm text-gray-500">
                            {test.trafficSplit[index]}% traffic
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-blue-600">
                          {calculateMetric(variant, test.winnerCriteria).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {test.winnerCriteria.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{test.name}</h3>
                      <p className="text-sm text-gray-600">
                        {getTestTypeLabel(test.type)} • Completed {new Date(test.endDate!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.results?.significant && (
                        <Badge className="bg-green-100 text-green-800">
                          Significant
                        </Badge>
                      )}
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                  </div>

                  {test.results && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          Winner: {test.variants.find(v => v.id === test.results?.winner)?.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{test.results.summary}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Improvement: <strong>{test.results.improvement.toFixed(1)}%</strong></span>
                        <span>Confidence: <strong>{test.results.confidence.toFixed(1)}%</strong></span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {test.variants.map((variant) => (
                      <div 
                        key={variant.id} 
                        className={`rounded-lg p-3 ${
                          test.results?.winner === variant.id 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{variant.name}</span>
                          {test.results?.winner === variant.id && (
                            <Trophy className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-lg font-semibold">
                          {calculateMetric(variant, test.winnerCriteria).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {variant.metrics.sent} sent • {variant.metrics.opened} opened
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TestTube2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No A/B Tests Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start optimizing your email campaigns with data-driven A/B testing
            </p>
            <Button onClick={() => setActiveTab('create')}>
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
