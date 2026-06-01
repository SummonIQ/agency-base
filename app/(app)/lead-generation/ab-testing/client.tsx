'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  TestTube,
  Plus,
  Play,
  Pause,
  Trophy,
  TrendingUp,
  Eye,
  MousePointer,
  MessageSquare,
  Target,
  Loader2,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Trash2,
} from 'lucide-react';

interface ABTestVariant {
  id: string;
  name: string;
  subject: string;
  content: string;
  weight: number;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  config: {
    duration: number;
    sampleSize: number;
    primaryMetric: string;
    confidenceLevel: number;
  };
  results?: Array<{
    variant: ABTestVariant;
    metrics: {
      sent: number;
      openRate: number;
      clickRate: number;
      replyRate: number;
      conversionRate: number;
    };
    isWinner?: boolean;
    pValue?: number;
  }>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  winningVariant?: string;
}

const primaryMetricOptions = [
  { value: 'open_rate', label: 'Open Rate' },
  { value: 'click_rate', label: 'Click Rate' },
  { value: 'reply_rate', label: 'Reply Rate' },
  { value: 'conversion_rate', label: 'Conversion Rate' },
];

const confidenceLevels = [
  { value: 90, label: '90%' },
  { value: 95, label: '95%' },
  { value: 99, label: '99%' },
];

export default function ABTestingClient() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    duration: '7',
    sampleSize: '100',
    primaryMetric: 'open_rate',
    confidenceLevel: '95',
    variants: [
      {
        id: 'variant_a',
        name: 'Variant A (Control)',
        subject: '',
        content: '',
        weight: 50,
      },
      {
        id: 'variant_b',
        name: 'Variant B',
        subject: '',
        content: '',
        weight: 50,
      },
    ] as ABTestVariant[],
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/lead-generation/ab-testing');
      if (response.ok) {
        const data = await response.json();
        setTests(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
  };

  const handleCreateTest = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: 'Test name required',
        description: 'Please provide a name for your A/B test',
        variant: 'destructive',
      });
      return;
    }

    const incompleteVariants = createForm.variants.filter(v => !v.subject.trim() || !v.content.trim());
    if (incompleteVariants.length > 0) {
      toast({
        title: 'Incomplete variants',
        description: 'All variants must have subject and content',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_test',
          data: {
            name: createForm.name,
            description: createForm.description,
            variants: createForm.variants,
            duration: parseInt(createForm.duration),
            sampleSize: parseInt(createForm.sampleSize),
            primaryMetric: createForm.primaryMetric,
            confidenceLevel: parseInt(createForm.confidenceLevel),
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'A/B test created',
          description: `Test "${createForm.name}" has been created`,
        });
        setShowCreateForm(false);
        setCreateForm({
          name: '',
          description: '',
          duration: '7',
          sampleSize: '100',
          primaryMetric: 'open_rate',
          confidenceLevel: '95',
          variants: [
            {
              id: 'variant_a',
              name: 'Variant A (Control)',
              subject: '',
              content: '',
              weight: 50,
            },
            {
              id: 'variant_b',
              name: 'Variant B',
              subject: '',
              content: '',
              weight: 50,
            },
          ],
        });
        fetchTests();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create test');
      }
    } catch (error) {
      console.error('Create test error:', error);
      toast({
        title: 'Failed to create test',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_test',
          data: { testId },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Test started',
          description: 'A/B test is now running',
        });
        fetchTests();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start test');
      }
    } catch (error) {
      console.error('Start test error:', error);
      toast({
        title: 'Failed to start test',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTest = async (testId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_test',
          data: { testId },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Test completed',
          description: 'A/B test results are now available',
        });
        fetchTests();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete test');
      }
    } catch (error) {
      console.error('Complete test error:', error);
      toast({
        title: 'Failed to complete test',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    const newVariant: ABTestVariant = {
      id: `variant_${String.fromCharCode(65 + createForm.variants.length).toLowerCase()}`,
      name: `Variant ${String.fromCharCode(65 + createForm.variants.length)}`,
      subject: '',
      content: '',
      weight: Math.round(100 / (createForm.variants.length + 1)),
    };

    // Redistribute weights equally
    const totalVariants = createForm.variants.length + 1;
    const equalWeight = Math.round(100 / totalVariants);

    setCreateForm(prev => ({
      ...prev,
      variants: [
        ...prev.variants.map(v => ({ ...v, weight: equalWeight })),
        newVariant,
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if (createForm.variants.length <= 2) {
      toast({
        title: 'Cannot remove variant',
        description: 'A/B test requires at least 2 variants',
        variant: 'destructive',
      });
      return;
    }

    const newVariants = createForm.variants.filter((_, i) => i !== index);
    const equalWeight = Math.round(100 / newVariants.length);

    setCreateForm(prev => ({
      ...prev,
      variants: newVariants.map(v => ({ ...v, weight: equalWeight })),
    }));
  };

  const updateVariant = (index: number, field: keyof ABTestVariant, value: string | number) => {
    setCreateForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8" />
            A/B Testing
          </h1>
          <p className="text-muted-foreground">Test email templates to optimize performance</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">All Tests</TabsTrigger>
          <TabsTrigger value="running">Running Tests</TabsTrigger>
          <TabsTrigger value="completed">Completed Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {tests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No A/B tests yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first A/B test to optimize your email templates
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {test.name}
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          {test.winningVariant && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Winner Found
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {test.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {test.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartTest(test.id)}
                            disabled={loading}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {test.status === 'running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteTest(test.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTest(test)}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Variants</div>
                        <div className="font-semibold">{test.variants.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Primary Metric</div>
                        <div className="font-semibold">
                          {primaryMetricOptions.find(m => m.value === test.config.primaryMetric)?.label}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div className="font-semibold">{test.config.duration} days</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Sample Size</div>
                        <div className="font-semibold">{test.config.sampleSize}</div>
                      </div>
                    </div>

                    {test.status === 'running' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>Day {Math.floor((new Date().getTime() - new Date(test.startedAt!).getTime()) / (1000 * 60 * 60 * 24))} of {test.config.duration}</span>
                        </div>
                        <Progress
                          value={Math.min(100, (Math.floor((new Date().getTime() - new Date(test.startedAt!).getTime()) / (1000 * 60 * 60 * 24)) / test.config.duration) * 100)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="running" className="space-y-4">
          <div className="grid gap-4">
            {tests.filter(t => t.status === 'running').map((test) => (
              <Card key={test.id}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{test.name}</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>Day {Math.floor((new Date().getTime() - new Date(test.startedAt!).getTime()) / (1000 * 60 * 60 * 24))} of {test.config.duration}</span>
                  </div>
                  <Progress
                    value={Math.min(100, (Math.floor((new Date().getTime() - new Date(test.startedAt!).getTime()) / (1000 * 60 * 60 * 24)) / test.config.duration) * 100)}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {tests.filter(t => t.status === 'completed').map((test) => (
              <Card key={test.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">{test.name}</h3>
                    {test.winningVariant && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Trophy className="h-3 w-3 mr-1" />
                        Winner Found
                      </Badge>
                    )}
                  </div>
                  {test.results && (
                    <div className="space-y-2">
                      {test.results.map((result, index) => (
                        <div key={index} className={`p-3 rounded border ${result.isWinner ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{result.variant.name}</span>
                            <div className="flex gap-4 text-sm">
                              <span>Open: {result.metrics.openRate.toFixed(1)}%</span>
                              <span>Click: {result.metrics.clickRate.toFixed(1)}%</span>
                              <span>Reply: {result.metrics.replyRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Test Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Create A/B Test</h2>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Test Name</Label>
                    <Input
                      id="test-name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({...prev, name: e.target.value}))}
                      placeholder="e.g., Subject Line Test Q4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary-metric">Primary Metric</Label>
                    <Select
                      value={createForm.primaryMetric}
                      onValueChange={(value) => setCreateForm(prev => ({...prev, primaryMetric: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {primaryMetricOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe what you're testing..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={createForm.duration}
                      onChange={(e) => setCreateForm(prev => ({...prev, duration: e.target.value}))}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sample-size">Sample Size</Label>
                    <Input
                      id="sample-size"
                      type="number"
                      value={createForm.sampleSize}
                      onChange={(e) => setCreateForm(prev => ({...prev, sampleSize: e.target.value}))}
                      min="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence Level</Label>
                    <Select
                      value={createForm.confidenceLevel}
                      onValueChange={(value) => setCreateForm(prev => ({...prev, confidenceLevel: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {confidenceLevels.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Variants */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Test Variants</h3>
                    <Button onClick={addVariant} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </div>

                  {createForm.variants.map((variant, index) => (
                    <Card key={variant.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{variant.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {variant.weight}% traffic
                            </span>
                            {createForm.variants.length > 2 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeVariant(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label>Subject Line</Label>
                          <Input
                            value={variant.subject}
                            onChange={(e) => updateVariant(index, 'subject', e.target.value)}
                            placeholder="Email subject line..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email Content</Label>
                          <Textarea
                            value={variant.content}
                            onChange={(e) => updateVariant(index, 'content', e.target.value)}
                            placeholder="Email content..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTest} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Test'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedTest.name} - Results</h2>
                <Button variant="ghost" onClick={() => setSelectedTest(null)}>
                  ×
                </Button>
              </div>

              {selectedTest.results ? (
                <div className="space-y-4">
                  {selectedTest.results.map((result, index) => (
                    <Card key={index} className={result.isWinner ? 'border-yellow-500' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {result.variant.name}
                          {result.isWinner && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="h-3 w-3 mr-1" />
                              Winner
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-4 mb-4">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {result.metrics.openRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Open Rate</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {result.metrics.clickRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Click Rate</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {result.metrics.replyRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Reply Rate</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {result.metrics.sent}
                            </div>
                            <div className="text-sm text-muted-foreground">Emails Sent</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="font-medium">Subject: {result.variant.subject}</div>
                          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                            {result.variant.content.substring(0, 200)}...
                          </div>
                        </div>

                        {result.pValue && (
                          <div className="mt-4 text-sm">
                            <div className={`flex items-center gap-2 ${result.pValue < 0.05 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.pValue < 0.05 ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertTriangle className="h-4 w-4" />
                              )}
                              <span>
                                P-value: {result.pValue.toFixed(4)}
                                {result.pValue < 0.05 ? ' (Statistically significant)' : ' (Not significant)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No results available yet. Start the test to begin collecting data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}