'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Settings,
  Mail,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface ActivationStep {
  id: string;
  title: string;
  status: 'completed' | 'pending' | 'in_progress';
  priority: 'critical' | 'high' | 'medium';
}

export function ActivationStatusWidget() {
  const [steps, setSteps] = useState<ActivationStep[]>([
    {
      id: 'api-config',
      title: 'API Configuration',
      status: 'pending',
      priority: 'critical'
    },
    {
      id: 'email-campaign',
      title: 'First Email Campaign',
      status: 'pending',
      priority: 'critical'
    },
    {
      id: 'linkedin-automation',
      title: 'LinkedIn Automation',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'recruiting-setup',
      title: 'Recruiting Pipeline',
      status: 'pending',
      priority: 'high'
    }
  ]);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const criticalSteps = steps.filter(step => step.priority === 'critical');
  const completedCritical = criticalSteps.filter(step => step.status === 'completed').length;

  const isFullyActivated = progressPercentage === 100;
  const hasCriticalSteps = completedCritical < criticalSteps.length;

  return (
    <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Platform Activation</CardTitle>
          </div>
          {isFullyActivated ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          ) : hasCriticalSteps ? (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              <Clock className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Setup Progress</span>
            <span className="text-muted-foreground">{completedSteps}/{totalSteps} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Status Message */}
        <div className="text-sm">
          {isFullyActivated ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Platform fully activated and revenue-ready!</span>
            </div>
          ) : hasCriticalSteps ? (
            <div className="text-muted-foreground">
              <span className="font-medium text-red-600 dark:text-red-400">
                {criticalSteps.length - completedCritical} critical steps remaining
              </span>
              <span className="block mt-1">Complete setup to start generating revenue</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <span className="font-medium text-blue-600 dark:text-blue-400">Great progress!</span>
              <span className="block mt-1">Complete remaining steps to unlock full potential</span>
            </div>
          )}
        </div>

        {/* Revenue Potential */}
        {!isFullyActivated && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">Revenue Potential: $30K-75K/month</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Time to first revenue: 2-4 weeks</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          {!isFullyActivated ? (
            <Button asChild className="flex-1">
              <Link href="/platform-activation">
                <Rocket className="h-4 w-4 mr-2" />
                Complete Setup
              </Link>
            </Button>
          ) : (
            <Button asChild className="flex-1">
              <Link href="/revenue-analytics">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          )}
          
          {hasCriticalSteps && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/integrations">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Next Steps Preview */}
        {!isFullyActivated && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <div className="font-medium mb-1">Next steps:</div>
            <div className="space-y-1">
              {steps
                .filter(step => step.status === 'pending')
                .slice(0, 2)
                .map(step => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                    <span>{step.title}</span>
                    {step.priority === 'critical' && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Critical
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
