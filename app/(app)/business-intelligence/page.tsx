'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  metric?: string;
}

interface Recommendation {
  id: string;
  category: 'outreach' | 'pricing' | 'process' | 'market';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  impact: string;
}

export default function BusinessIntelligence() {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('insights');

  const insights: Insight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Network Referrals Outperforming',
      description: 'Network referrals have 78% success rate vs 45% for cold outreach. Opportunity to expand network outreach.',
      impact: 'high',
      action: 'Increase network mapping and warm introductions',
      metric: '+33% higher success rate'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Pipeline Concentration Risk',
      description: '60% of pipeline value concentrated in 3 deals. Risk if any deals fall through.',
      impact: 'medium',
      action: 'Diversify pipeline with more smaller deals',
      metric: '$291K concentrated in 3 deals'
    },
    {
      id: '3',
      type: 'success',
      title: 'Recruiting Revenue Growing',
      description: 'Recruiting revenue up 45% this quarter. Strong market demand for technical talent.',
      impact: 'high',
      action: 'Scale recruiting operations and team',
      metric: '+45% quarter growth'
    },
    {
      id: '4',
      type: 'trend',
      title: 'LinkedIn Engagement Increasing',
      description: 'LinkedIn connection acceptance rate improved from 65% to 71% over last month.',
      impact: 'medium',
      action: 'Continue optimizing LinkedIn messaging',
      metric: '+6% acceptance rate improvement'
    }
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      category: 'outreach',
      title: 'Implement Multi-Channel Outreach',
      description: 'Combine email, LinkedIn, and phone outreach for higher response rates. Studies show 3x improvement with multi-channel approach.',
      priority: 'high',
      effort: 'medium',
      impact: '3x response rate improvement'
    },
    {
      id: '2',
      category: 'pricing',
      title: 'Introduce Retainer Model',
      description: 'Offer monthly retainer packages for ongoing recruiting needs. Provides predictable revenue and deeper client relationships.',
      priority: 'high',
      effort: 'low',
      impact: '$10-20K monthly recurring revenue'
    },
    {
      id: '3',
      category: 'process',
      title: 'Automate Follow-up Sequences',
      description: 'Set up automated email sequences for prospects who don\'t respond initially. Can recover 15-20% of non-responders.',
      priority: 'medium',
      effort: 'low',
      impact: '+15-20% lead recovery'
    },
    {
      id: '4',
      category: 'market',
      title: 'Expand to Remote-First Companies',
      description: 'Target remote-first companies with distributed teams. Growing market segment with unique hiring challenges.',
      priority: 'medium',
      effort: 'medium',
      impact: '40% larger addressable market'
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'trend': return <Activity className="h-5 w-5 text-purple-600" />;
      default: return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'trend': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'outreach': return <Mail className="h-4 w-4" />;
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'process': return <Zap className="h-4 w-4" />;
      case 'market': return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Business Intelligence
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered insights and recommendations to optimize your business performance
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Revenue Growth</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">+23%</div>
              <div className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">18.5%</div>
              <div className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+2.3% improvement</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Active Prospects</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">147</div>
              <div className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+31 this week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Pipeline Value</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">$485K</div>
              <div className="flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+45% growth</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Forecasting
            </TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI-Powered Business Insights</h2>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight) => (
                <Card key={insight.id} className={`border-2 ${getInsightColor(insight.type)}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">{insight.description}</p>
                      
                      {insight.metric && (
                        <div className="bg-white p-3 rounded-lg border">
                          <span className="text-sm font-medium text-gray-600">Key Metric: </span>
                          <span className="font-semibold">{insight.metric}</span>
                        </div>
                      )}
                      
                      <div className="bg-white p-3 rounded-lg border">
                        <span className="text-sm font-medium text-gray-600">Recommended Action: </span>
                        <span className="font-medium">{insight.action}</span>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Implement Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Strategic Recommendations</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select defaultValue="priority">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="impact">Impact</SelectItem>
                    <SelectItem value="effort">Effort</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(rec.category)}
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {rec.effort} effort
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">{rec.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Expected Impact: </span>
                          <span className="font-semibold text-blue-700">{rec.impact}</span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Implementation: </span>
                          <span className="font-semibold text-green-700">{rec.effort} effort required</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button className="flex-1">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Start Implementation
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule for Later
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <h2 className="text-2xl font-bold">Market & Performance Trends</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium">Recruiting Revenue</span>
                        <p className="text-sm text-gray-600">Consistent 15% monthly growth</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">+45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium">Agency Projects</span>
                        <p className="text-sm text-gray-600">Seasonal fluctuation pattern</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-600">+12%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <span className="font-medium">Consulting</span>
                        <p className="text-sm text-gray-600">New revenue stream emerging</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-600">+67%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Talent Shortage Intensifying</span>
                      </div>
                      <p className="text-sm text-gray-600">Senior developer demand up 34% this quarter</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Remote Work Stabilizing</span>
                      </div>
                      <p className="text-sm text-gray-600">Hybrid model becoming standard practice</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">AI Skills Premium</span>
                      </div>
                      <p className="text-sm text-gray-600">AI/ML roles commanding 25% salary premium</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecasting Tab */}
          <TabsContent value="forecasting" className="space-y-6">
            <h2 className="text-2xl font-bold">Business Forecasting</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium">Q1 2024 Projection</span>
                        <p className="text-sm text-gray-600">Conservative estimate</p>
                      </div>
                      <span className="font-bold text-blue-600">$185,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium">Q2 2024 Projection</span>
                        <p className="text-sm text-gray-600">Growth trajectory</p>
                      </div>
                      <span className="font-bold text-green-600">$245,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <span className="font-medium">Annual Target</span>
                        <p className="text-sm text-gray-600">Stretch goal</p>
                      </div>
                      <span className="font-bold text-purple-600">$850,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Conservative</span>
                        <span className="text-sm text-red-600">15% growth</span>
                      </div>
                      <p className="text-sm text-gray-600">Current trajectory maintained</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Moderate</span>
                        <span className="text-sm text-yellow-600">35% growth</span>
                      </div>
                      <p className="text-sm text-gray-600">With recommended optimizations</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Aggressive</span>
                        <span className="text-sm text-green-600">65% growth</span>
                      </div>
                      <p className="text-sm text-gray-600">Full market expansion strategy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
