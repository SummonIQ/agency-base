'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Rocket, 
  Settings, 
  Mail, 
  Users, 
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  ExternalLink,
  Play,
  ArrowRight,
  Star,
  Calendar,
  BarChart3,
  Shield,
  Database,
  Linkedin,
  Send,
  UserPlus,
  Eye,
  Timer,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

interface ActivationStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'critical' | 'high' | 'medium';
  status: 'completed' | 'in_progress' | 'pending';
  category: 'setup' | 'campaign' | 'automation' | 'monitoring';
  revenueImpact: string;
  actionUrl: string;
  icon: any;
  requirements?: string[];
  tips?: string[];
}

interface ActivationStats {
  totalSteps: number;
  completedSteps: number;
  estimatedRevenue: string;
  timeToRevenue: string;
  completionPercentage: number;
}

export default function PlatformActivationPage() {
  const [activationSteps, setActivationSteps] = useState<ActivationStep[]>([
    {
      id: 'api-config',
      title: 'Configure API Integrations',
      description: 'Set up SendGrid, Apollo.io, and LinkedIn API keys for full platform functionality',
      estimatedTime: '15 minutes',
      priority: 'critical',
      status: 'pending',
      category: 'setup',
      revenueImpact: '$50K-150K/month potential',
      actionUrl: '/settings/integrations',
      icon: Settings,
      requirements: [
        'SendGrid account (free tier available)',
        'Apollo.io API key',
        'LinkedIn Developer App (optional)'
      ],
      tips: [
        'Start with SendGrid for immediate email capabilities',
        'Apollo.io free tier provides 50 credits/month',
        'LinkedIn integration can be added later'
      ]
    },
    {
      id: 'email-campaign',
      title: 'Launch First Email Campaign',
      description: 'Create and send your first automated email campaign to warm contacts',
      estimatedTime: '20 minutes',
      priority: 'critical',
      status: 'pending',
      category: 'campaign',
      revenueImpact: '5-10 responses expected',
      actionUrl: '/email-marketing',
      icon: Mail,
      requirements: [
        'SendGrid API configured',
        '10-20 warm contacts',
        'Email template selected'
      ],
      tips: [
        'Start with your existing network',
        'Use proven templates from the library',
        'Personalize the first line for better response rates'
      ]
    },
    {
      id: 'linkedin-automation',
      title: 'Activate LinkedIn Automation',
      description: 'Set up automated LinkedIn connection requests and messaging sequences',
      estimatedTime: '15 minutes',
      priority: 'high',
      status: 'pending',
      category: 'automation',
      revenueImpact: '15-25 connections/week',
      actionUrl: '/linkedin-integration',
      icon: Linkedin,
      requirements: [
        'LinkedIn Premium or Sales Navigator',
        'Target prospect list',
        'Connection message templates'
      ],
      tips: [
        'Start with 5-10 requests per day',
        'Focus on quality over quantity',
        'Personalize connection messages'
      ]
    },
    {
      id: 'recruiting-setup',
      title: 'Initialize Recruiting Pipeline',
      description: 'Set up candidate database and create your first talent pools',
      estimatedTime: '25 minutes',
      priority: 'high',
      status: 'pending',
      category: 'setup',
      revenueImpact: '$15K-30K per placement',
      actionUrl: '/recruiting-dashboard',
      icon: Users,
      requirements: [
        'Candidate database access',
        'Job requirements defined',
        'Client contact list'
      ],
      tips: [
        'Start with tech roles you understand',
        'Build talent pools by specialization',
        'Track all candidate interactions'
      ]
    },
    {
      id: 'automation-sequences',
      title: 'Create Multi-Channel Sequences',
      description: 'Build automated follow-up sequences combining email and LinkedIn',
      estimatedTime: '30 minutes',
      priority: 'high',
      status: 'pending',
      category: 'automation',
      revenueImpact: '10x efficiency increase',
      actionUrl: '/automation-sequences',
      icon: Zap,
      requirements: [
        'Email templates ready',
        'LinkedIn messages prepared',
        'Target audience defined'
      ],
      tips: [
        'Create 3-5 touch point sequences',
        'Mix email and LinkedIn for best results',
        'Include value-add content in each message'
      ]
    },
    {
      id: 'analytics-monitoring',
      title: 'Set Up Performance Monitoring',
      description: 'Configure revenue analytics and performance tracking dashboards',
      estimatedTime: '10 minutes',
      priority: 'medium',
      status: 'pending',
      category: 'monitoring',
      revenueImpact: 'ROI optimization',
      actionUrl: '/revenue-analytics',
      icon: BarChart3,
      requirements: [
        'Campaign data flowing',
        'Revenue targets set',
        'KPIs defined'
      ],
      tips: [
        'Monitor daily for first week',
        'Track response rates by channel',
        'Adjust messaging based on performance'
      ]
    }
  ]);

  const [stats, setStats] = useState<ActivationStats>({
    totalSteps: 6,
    completedSteps: 0,
    estimatedRevenue: '$30K-75K',
    timeToRevenue: '2-4 weeks',
    completionPercentage: 0
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const completed = activationSteps.filter(step => step.status === 'completed').length;
    const percentage = (completed / activationSteps.length) * 100;
    
    setStats(prev => ({
      ...prev,
      completedSteps: completed,
      completionPercentage: percentage
    }));
  }, [activationSteps]);

  const updateStepStatus = (stepId: string, status: 'completed' | 'in_progress' | 'pending') => {
    setActivationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'setup':
        return <Settings className="h-4 w-4" />;
      case 'campaign':
        return <Send className="h-4 w-4" />;
      case 'automation':
        return <Zap className="h-4 w-4" />;
      case 'monitoring':
        return <Eye className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const filteredSteps = activeCategory === 'all' 
    ? activationSteps 
    : activationSteps.filter(step => step.category === activeCategory);

  const criticalSteps = activationSteps.filter(step => step.priority === 'critical');
  const completedCritical = criticalSteps.filter(step => step.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Platform Activation Center
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete these steps to activate your $200K+ business automation platform and start generating revenue
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{Math.round(stats.completionPercentage)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedSteps}/{stats.totalSteps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Potential</p>
                <p className="text-lg font-bold">{stats.estimatedRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time to Revenue</p>
                <p className="text-lg font-bold">{stats.timeToRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Activation Progress</h3>
              <Badge variant="outline">{stats.completedSteps} of {stats.totalSteps} completed</Badge>
            </div>
            <Progress value={stats.completionPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Platform Setup</span>
              <span>Revenue Generation Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Steps Alert */}
      {completedCritical < criticalSteps.length && (
        <Alert>
          <Rocket className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Steps Remaining:</strong> Complete {criticalSteps.length - completedCritical} critical steps to unlock core platform functionality and start generating revenue.
          </AlertDescription>
        </Alert>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          All Steps
        </Button>
        <Button
          variant={activeCategory === 'setup' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('setup')}
        >
          <Settings className="h-4 w-4 mr-1" />
          Setup
        </Button>
        <Button
          variant={activeCategory === 'campaign' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('campaign')}
        >
          <Send className="h-4 w-4 mr-1" />
          Campaigns
        </Button>
        <Button
          variant={activeCategory === 'automation' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('automation')}
        >
          <Zap className="h-4 w-4 mr-1" />
          Automation
        </Button>
        <Button
          variant={activeCategory === 'monitoring' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('monitoring')}
        >
          <Eye className="h-4 w-4 mr-1" />
          Monitoring
        </Button>
      </div>

      {/* Activation Steps */}
      <div className="space-y-4">
        {filteredSteps.map((step, index) => (
          <Card key={step.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <step.icon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <Badge className={getPriorityColor(step.priority)}>
                          {step.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        {step.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        {step.revenueImpact}
                      </div>
                    </div>
                  </div>

                  {/* Requirements & Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {step.requirements && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {step.requirements.map((req, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.tips && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Pro Tips:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {step.tips.map((tip, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(step.category)}
                        <span className="ml-1 capitalize">{step.category}</span>
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {step.status === 'completed' ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={step.actionUrl}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStepStatus(step.id, 'in_progress')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                          <Button size="sm" asChild>
                            <Link href={step.actionUrl}>
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Go to {step.title.split(' ')[0]}
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/api-validation">
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Check API Status</div>
                  <div className="text-sm text-muted-foreground">Validate all integrations</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/business-documentation">
                <div className="text-center">
                  <Database className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">View Documentation</div>
                  <div className="text-sm text-muted-foreground">Complete system guide</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/action-plan">
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Execution Plan</div>
                  <div className="text-sm text-muted-foreground">Step-by-step roadmap</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {stats.completionPercentage === 100 && (
        <Alert>
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            <strong>🎉 Congratulations!</strong> Your platform is fully activated and ready to generate revenue. Monitor your performance at the Revenue Analytics dashboard.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
