'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Mail,
  BarChart3,
  Settings,
  Eye,
  Gauge
} from 'lucide-react';

export interface DeliverabilityData {
  score: number;
  reputation: number;
  deliveryRate: number;
  bounceRate: number;
  complaintRate: number;
  authentication: {
    spf: boolean;
    dkim: boolean;
    dmarc: boolean;
  };
  content: {
    spamScore: number;
    subjectLineScore: number;
    contentQuality: number;
  };
  lists: {
    healthScore: number;
    suppressedCount: number;
    engagementRate: number;
  };
  recommendations: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'moderate' | 'complex';
  }>;
}

interface DeliverabilityOptimizerProps {
  data: DeliverabilityData;
  onRunCheck: (type: string) => void;
  onApplyFix: (recommendationId: string) => void;
}

export function DeliverabilityOptimizer({
  data,
  onRunCheck,
  onApplyFix
}: DeliverabilityOptimizerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'authentication' | 'content' | 'lists'>('overview');

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRecommendationBadge = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const criticalIssues = data.recommendations.filter(r => r.type === 'critical').length;
  const warningIssues = data.recommendations.filter(r => r.type === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Overview Score */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(data.score)} mb-4`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
              {data.score}
            </div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Deliverability Health</h2>
        <p className="text-gray-600">
          {data.score >= 80 ? 'Excellent deliverability' : 
           data.score >= 60 ? 'Good with room for improvement' : 
           'Needs immediate attention'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Delivery Rate</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(data.deliveryRate)}`}>
              {data.deliveryRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Reputation</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(data.reputation)}`}>
              {data.reputation}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">Bounce Rate</span>
            </div>
            <div className={`text-3xl font-bold ${data.bounceRate <= 2 ? 'text-green-600' : 'text-red-600'}`}>
              {data.bounceRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Engagement</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(data.lists.engagementRate)}`}>
              {data.lists.engagementRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalIssues} critical issue{criticalIssues > 1 ? 's' : ''}</strong> found that could severely impact deliverability. 
            Address these immediately to prevent your emails from being blocked.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Authentication Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">SPF Record</span>
              {data.authentication.spf ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">DKIM Record</span>
              {data.authentication.dkim ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">DMARC Record</span>
              {data.authentication.dmarc ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRunCheck('authentication')}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Check Authentication
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Content Quality
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Spam Score</span>
                <span className={getScoreColor(100 - data.content.spamScore)}>
                  {data.content.spamScore.toFixed(1)}
                </span>
              </div>
              <Progress value={100 - data.content.spamScore} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Subject Line Quality</span>
                <span className={getScoreColor(data.content.subjectLineScore)}>
                  {data.content.subjectLineScore.toFixed(1)}
                </span>
              </div>
              <Progress value={data.content.subjectLineScore} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Content Quality</span>
                <span className={getScoreColor(data.content.contentQuality)}>
                  {data.content.contentQuality.toFixed(1)}
                </span>
              </div>
              <Progress value={data.content.contentQuality} className="h-2" />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRunCheck('content')}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analyze Content
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-6 w-6" />
              List Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Health</span>
                <span className={getScoreColor(data.lists.healthScore)}>
                  {data.lists.healthScore.toFixed(1)}
                </span>
              </div>
              <Progress value={data.lists.healthScore} className="h-2" />
            </div>

            <div className="text-sm">
              <div className="flex justify-between">
                <span>Suppressed Contacts</span>
                <span className="font-medium">{data.lists.suppressedCount.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-sm">
              <div className="flex justify-between">
                <span>Engagement Rate</span>
                <span className={`font-medium ${getScoreColor(data.lists.engagementRate)}`}>
                  {data.lists.engagementRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRunCheck('lists')}
              className="w-full"
            >
              <Gauge className="h-4 w-4 mr-2" />
              Check List Health
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              Optimization Recommendations
            </CardTitle>
            <div className="flex gap-2">
              {criticalIssues > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {criticalIssues} Critical
                </Badge>
              )}
              {warningIssues > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {warningIssues} Warnings
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getRecommendationIcon(recommendation.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{recommendation.title}</h4>
                        <Badge className={getRecommendationBadge(recommendation.type)}>
                          {recommendation.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {recommendation.description}
                      </p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Impact: <strong className="capitalize">{recommendation.impact}</strong></span>
                        <span>Effort: <strong className="capitalize">{recommendation.effort}</strong></span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={recommendation.type === 'critical' ? 'default' : 'outline'}
                    onClick={() => onApplyFix(recommendation.id)}
                  >
                    {recommendation.effort === 'easy' ? 'Quick Fix' : 'Apply Fix'}
                  </Button>
                </div>
              </div>
            ))}

            {data.recommendations.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Good!
                </h3>
                <p className="text-gray-600">
                  Your email deliverability is optimized. Keep up the great work!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => onRunCheck('full')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Run Full Analysis
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => onRunCheck('warmup')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Start IP Warmup
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => onRunCheck('monitor')}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Setup Monitoring
        </Button>
      </div>
    </div>
  );
}
