'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  MessageSquare,
  Eye,
  Search,
  TrendingUp,
  Settings,
  Zap,
  Target,
  Calendar,
  Activity
} from 'lucide-react';
import { 
  LinkedInComplianceService, 
  SafetySettings, 
  ComplianceCheck, 
  AccountWarming,
  assessRiskLevel 
} from '@/lib/recruiting/linkedin-compliance-service';

interface LinkedInComplianceDashboardProps {
  settings: SafetySettings;
  onUpdateSettings: (settings: Partial<SafetySettings>) => void;
  onCheckAction: (action: string) => ComplianceCheck;
}

export function LinkedInComplianceDashboard({ 
  settings, 
  onUpdateSettings, 
  onCheckAction 
}: LinkedInComplianceDashboardProps) {
  const [complianceService] = useState(() => new LinkedInComplianceService(settings));
  const [compliance, setCompliance] = useState(complianceService.checkCompliance());
  const [warming, setWarming] = useState(complianceService.getAccountWarming());
  const [recommendations, setRecommendations] = useState(complianceService.generateSafetyRecommendations());

  useEffect(() => {
    const newCompliance = complianceService.checkCompliance();
    const newWarming = complianceService.getAccountWarming();
    const newRecommendations = complianceService.generateSafetyRecommendations();
    
    setCompliance(newCompliance);
    setWarming(newWarming);
    setRecommendations(newRecommendations);
  }, [settings, complianceService]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'warming': return 'bg-yellow-100 text-yellow-800';
      case 'established': return 'bg-blue-100 text-blue-800';
      case 'full_capacity': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const dailyLimits = complianceService['limits']; // Access private property for display

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            LinkedIn Compliance Dashboard
          </h2>
          <p className="text-gray-600">Monitor and maintain safe automation practices</p>
        </div>
        <Badge className={getRiskColor(settings.riskLevel)}>
          {settings.riskLevel.toUpperCase()} RISK
        </Badge>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Compliance Score</h3>
              <p className="text-sm text-gray-600">Overall account health and safety rating</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${getScoreColor(compliance.score)}`}>
              <div className="text-3xl font-bold">{compliance.score}</div>
              <div className="text-sm">/ 100</div>
            </div>
          </div>
          
          <Progress value={compliance.score} className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">{compliance.violations.length}</div>
              <div className="text-sm text-red-700">Violations</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">{compliance.warnings.length}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{settings.warningFlags.length}</div>
              <div className="text-sm text-blue-700">Flags</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Activity vs Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Connections Today</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {settings.recentActivity.connectionsToday}/{dailyLimits?.connectionsPerDay || 0}
            </div>
            <Progress 
              value={(settings.recentActivity.connectionsToday / (dailyLimits?.connectionsPerDay || 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Messages Today</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {settings.recentActivity.messagesToday}/{dailyLimits?.messagesPerDay || 0}
            </div>
            <Progress 
              value={(settings.recentActivity.messagesToday / (dailyLimits?.messagesPerDay || 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Profile Views Today</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {settings.recentActivity.profileViewsToday}/{dailyLimits?.profileViewsPerDay || 0}
            </div>
            <Progress 
              value={(settings.recentActivity.profileViewsToday / (dailyLimits?.profileViewsPerDay || 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Searches Today</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {settings.recentActivity.searchesToday}/{dailyLimits?.searchesPerDay || 0}
            </div>
            <Progress 
              value={(settings.recentActivity.searchesToday / (dailyLimits?.searchesPerDay || 1)) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Account Warming Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Account Warming Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className={getPhaseColor(warming.phase)}>
                {warming.phase.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Day {warming.daysInPhase} in current phase
              </p>
            </div>
            {warming.nextPhaseDate !== 'N/A - Already at full capacity' && (
              <div className="text-right">
                <div className="text-sm font-medium">Next Phase:</div>
                <div className="text-sm text-gray-600">{warming.nextPhaseDate}</div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Warming Tips:</h4>
            <ul className="space-y-2">
              {warming.warmingTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Violations and Warnings */}
      {(compliance.violations.length > 0 || compliance.warnings.length > 0) && (
        <div className="space-y-4">
          {compliance.violations.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Compliance Violations:</strong>
                <ul className="mt-2 space-y-1">
                  {compliance.violations.map((violation, index) => (
                    <li key={index} className="text-sm">• {violation}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {compliance.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings:</strong>
                <ul className="mt-2 space-y-1">
                  {compliance.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Safety Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Safety Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>All safety recommendations are being followed!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Account Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Account Type</Label>
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {settings.accountType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div>
                <Label className="font-medium">Account Age</Label>
                <p className="text-sm text-gray-600">{settings.accountAge} months</p>
              </div>

              <div>
                <Label className="font-medium">Connection Acceptance Rate</Label>
                <div className="flex items-center gap-2">
                  <Progress value={settings.connectionAcceptanceRate} className="flex-1" />
                  <span className="text-sm font-medium">{settings.connectionAcceptanceRate}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-medium">Current Connections</Label>
                <p className="text-sm text-gray-600">
                  {settings.currentConnections.toLocaleString()} / {settings.maxConnections.toLocaleString()}
                </p>
                <Progress 
                  value={(settings.currentConnections / settings.maxConnections) * 100} 
                  className="mt-1" 
                />
              </div>

              <div>
                <Label className="font-medium">Risk Level</Label>
                <Badge className={getRiskColor(settings.riskLevel)}>
                  {settings.riskLevel.toUpperCase()}
                </Badge>
              </div>

              <div>
                <Label className="font-medium">Warning Flags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {settings.warningFlags.length > 0 ? (
                    settings.warningFlags.map((flag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {flag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No warnings</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Delays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Recommended Action Delays
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { action: 'connection_request', icon: Users, label: 'Connection Requests' },
              { action: 'message', icon: MessageSquare, label: 'Messages' },
              { action: 'profile_view', icon: Eye, label: 'Profile Views' },
              { action: 'search', icon: Search, label: 'Searches' }
            ].map(({ action, icon: Icon, label }) => {
              const delay = complianceService.getActionDelay(action as any);
              return (
                <div key={action} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {delay.min}s - {delay.max}s
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
