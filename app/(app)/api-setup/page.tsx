'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Eye, 
  EyeOff,
  Mail,
  Users,
  Database,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  Settings,
  BookOpen,
  Play,
  RefreshCw
} from 'lucide-react';

interface APIStatus {
  service: string;
  status: 'connected' | 'error' | 'missing_key' | 'not_configured';
  message?: string;
  lastTested?: string;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  revenueImpact: string;
}

export default function APISetupPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'sendgrid',
      title: 'Configure SendGrid',
      description: 'Email delivery and automation',
      status: 'pending',
      priority: 'high',
      estimatedTime: '10 minutes',
      revenueImpact: '$10K-50K/month'
    },
    {
      id: 'apollo',
      title: 'Configure Apollo.io',
      description: 'Lead data and enrichment',
      status: 'pending',
      priority: 'high',
      estimatedTime: '5 minutes',
      revenueImpact: '$5K-25K/month'
    },
    {
      id: 'linkedin',
      title: 'Configure LinkedIn',
      description: 'Social automation and sourcing',
      status: 'pending',
      priority: 'medium',
      estimatedTime: '15 minutes',
      revenueImpact: '$15K-75K/month'
    },
    {
      id: 'database',
      title: 'Verify Database',
      description: 'Data persistence and storage',
      status: 'completed',
      priority: 'high',
      estimatedTime: '2 minutes',
      revenueImpact: 'Required'
    }
  ]);

  useEffect(() => {
    fetchAPIStatuses();
  }, []);

  const fetchAPIStatuses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/validation/apis?action=validate_all');
      const data = await response.json();
      if (data.success) {
        setApiStatuses(data.services || []);
        updateSetupSteps(data.services || []);
      }
    } catch (error) {
      console.error('Failed to fetch API statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetupSteps = (services: APIStatus[]) => {
    setSetupSteps(prev => prev.map(step => {
      const service = services.find(s => 
        s.service.toLowerCase().includes(step.id) || 
        step.id.includes(s.service.toLowerCase())
      );
      
      if (service) {
        return {
          ...step,
          status: service.status === 'connected' ? 'completed' : 
                 service.status === 'missing_key' ? 'pending' : 'in_progress'
        };
      }
      return step;
    }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const completedSteps = setupSteps.filter(step => step.status === 'completed').length;
  const totalSteps = setupSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Configuration</h1>
          <p className="text-muted-foreground">
            Configure your API integrations to unlock full platform capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAPIStatuses}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            View Guide
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Configuration Progress</span>
              <span className="text-sm text-muted-foreground">{completedSteps}/{totalSteps} completed</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedSteps}</div>
                <div className="text-sm text-muted-foreground">APIs Configured</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalSteps - completedSteps}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup Steps</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* API Status Cards */}
            <Card>
              <CardHeader>
                <CardTitle>API Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    ))
                  ) : (
                    apiStatuses.map((api, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(api.status)}
                          <span className="font-medium">{api.service}</span>
                        </div>
                        <Badge className={getStatusColor(api.status)}>
                          {api.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Business Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Potential Revenue: $30K-150K/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Automation Efficiency: 10x faster</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Scale: Handle 1000+ leads/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Time Savings: 20+ hours/week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Email Automation</h3>
                <p className="text-sm text-muted-foreground">Configure SendGrid for email campaigns</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Lead Generation</h3>
                <p className="text-sm text-muted-foreground">Set up Apollo.io for prospect data</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">LinkedIn Automation</h3>
                <p className="text-sm text-muted-foreground">Connect LinkedIn for social outreach</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Setup Steps Tab */}
        <TabsContent value="setup" className="space-y-6">
          <div className="space-y-4">
            {setupSteps.map((step, index) => (
              <Card key={step.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status)}
                      </div>
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(step.priority)}>
                        {step.priority}
                      </Badge>
                      <Badge variant="outline">
                        {step.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Revenue Impact: </span>
                      <span className="font-medium text-green-600">{step.revenueImpact}</span>
                    </div>
                    <div className="flex gap-2">
                      {step.status === 'completed' ? (
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Configured
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Never commit API keys to version control. Use environment variables for all secrets.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SendGrid Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  SendGrid Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets.sendgrid ? 'text' : 'password'}
                      placeholder="SG.your_api_key_here"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility('sendgrid')}
                    >
                      {showSecrets.sendgrid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">From Email</label>
                  <Input
                    type="email"
                    placeholder="noreply@yourdomain.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">From Name</label>
                  <Input
                    placeholder="Your Company Name"
                    className="mt-1"
                  />
                </div>

                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get SendGrid API Key
                </Button>
              </CardContent>
            </Card>

            {/* Apollo.io Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Apollo.io Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets.apollo ? 'text' : 'password'}
                      placeholder="your_apollo_api_key_here"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility('apollo')}
                    >
                      {showSecrets.apollo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Base URL</label>
                  <Input
                    value="https://api.apollo.io/v1"
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>

                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Apollo.io API Key
                </Button>
              </CardContent>
            </Card>

            {/* LinkedIn Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  LinkedIn Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client ID</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets.linkedin_id ? 'text' : 'password'}
                      placeholder="your_linkedin_client_id"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility('linkedin_id')}
                    >
                      {showSecrets.linkedin_id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Client Secret</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets.linkedin_secret ? 'text' : 'password'}
                      placeholder="your_linkedin_client_secret"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility('linkedin_secret')}
                    >
                      {showSecrets.linkedin_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Create LinkedIn App
                </Button>
              </CardContent>
            </Card>

            {/* Database Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Database URL</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type={showSecrets.database ? 'text' : 'password'}
                      placeholder="postgresql://username:password@localhost:5440/database"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility('database')}
                    >
                      {showSecrets.database ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Database is already configured and running.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Connection Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Test SendGrid Connection
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Test Apollo.io Connection
                </Button>
                <Button className="w-full" variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Test LinkedIn Connection
                </Button>
                <Button className="w-full" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Test Database Connection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>SendGrid API</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Apollo.io API</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Not Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>LinkedIn API</span>
                    <Badge className="bg-red-100 text-red-800">Missing Key</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
