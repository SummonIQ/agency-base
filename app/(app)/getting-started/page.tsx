'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Rocket, 
  CheckCircle, 
  ArrowRight, 
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  Settings,
  Zap,
  BarChart3,
  Target,
  Play,
  ExternalLink,
  Lightbulb,
  Timer,
  Star,
  Trophy,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface QuickWin {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  revenueImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  actionUrl: string;
  icon: any;
  completed: boolean;
}

export default function GettingStartedPage() {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([
    {
      id: 'api-setup',
      title: 'Configure SendGrid API',
      description: 'Set up email delivery to start sending campaigns immediately',
      timeEstimate: '5 minutes',
      revenueImpact: 'Enables $10K-50K/month',
      difficulty: 'easy',
      actionUrl: '/settings/integrations',
      icon: Mail,
      completed: false
    },
    {
      id: 'first-campaign',
      title: 'Send First Email Campaign',
      description: 'Launch your first email to 10-20 warm contacts',
      timeEstimate: '15 minutes',
      revenueImpact: '5-10 responses expected',
      difficulty: 'easy',
      actionUrl: '/email-marketing',
      icon: Target,
      completed: false
    },
    {
      id: 'linkedin-connect',
      title: 'Start LinkedIn Automation',
      description: 'Send 5-10 connection requests to prospects',
      timeEstimate: '10 minutes',
      revenueImpact: '3-5 new connections',
      difficulty: 'medium',
      actionUrl: '/linkedin-integration',
      icon: Users,
      completed: false
    },
    {
      id: 'recruiting-pipeline',
      title: 'Add First Candidates',
      description: 'Import 10-20 candidates to your recruiting pipeline',
      timeEstimate: '20 minutes',
      revenueImpact: '$15K-30K per placement',
      difficulty: 'medium',
      actionUrl: '/recruiting-dashboard',
      icon: Users,
      completed: false
    }
  ]);

  const completedWins = quickWins.filter(win => win.completed).length;
  const totalWins = quickWins.length;
  const progressPercentage = (completedWins / totalWins) * 100;

  const toggleCompleted = (id: string) => {
    setQuickWins(prev => prev.map(win => 
      win.id === id ? { ...win, completed: !win.completed } : win
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Getting Started
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your $200K+ business automation platform is ready. Complete these quick wins to start generating revenue today.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Setup Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedWins}/{totalWins}</div>
              <div className="text-sm text-muted-foreground">Quick Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">2-4</div>
              <div className="text-sm text-muted-foreground">Weeks to Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">$30K+</div>
              <div className="text-sm text-muted-foreground">Monthly Potential</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Revenue Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="font-bold text-blue-600 dark:text-blue-400">Week 1</div>
              <div className="text-sm text-muted-foreground mt-1">5-10 responses</div>
              <div className="text-sm text-muted-foreground">2-3 meetings</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="font-bold text-green-600 dark:text-green-400">Week 2-3</div>
              <div className="text-sm text-muted-foreground mt-1">Qualified meetings</div>
              <div className="text-sm text-muted-foreground">First contracts</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="font-bold text-purple-600 dark:text-purple-400">Month 1</div>
              <div className="text-sm text-muted-foreground mt-1">$15K-30K signed</div>
              <div className="text-sm text-muted-foreground">Pipeline built</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="font-bold text-orange-600 dark:text-orange-400">Month 2+</div>
              <div className="text-sm text-muted-foreground mt-1">$30K-75K/month</div>
              <div className="text-sm text-muted-foreground">Automated flow</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Quick Wins (Start Here)</h2>
          <Badge variant="outline">{completedWins} of {totalWins} completed</Badge>
        </div>

        <div className="grid gap-4">
          {quickWins.map((win, index) => (
            <Card key={win.id} className={`hover:shadow-md transition-shadow ${win.completed ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Status */}
                  <div className="flex-shrink-0 mt-1">
                    {win.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <win.icon className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{win.title}</h3>
                          <Badge className={getDifficultyColor(win.difficulty)}>
                            {win.difficulty}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{win.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Timer className="h-3 w-3" />
                          {win.timeEstimate}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {win.revenueImpact}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={win.completed}
                          onChange={() => toggleCompleted(win.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-muted-foreground">
                          Mark as completed
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {win.completed ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={win.actionUrl}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Review
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" asChild>
                            <Link href={win.actionUrl}>
                              <Play className="h-4 w-4 mr-1" />
                              Start Now
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Alert */}
      {progressPercentage === 100 && (
        <Alert>
          <Trophy className="h-4 w-4" />
          <AlertDescription>
            <strong>🎉 Congratulations!</strong> You've completed all quick wins. Your platform is ready to generate revenue. Check your <Link href="/revenue-analytics" className="underline">Revenue Analytics</Link> to monitor performance.
          </AlertDescription>
        </Alert>
      )}

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Pro Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Email Campaigns</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Start with warm contacts for higher response rates
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Personalize the first line of every email
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Follow up 2-3 times with value-add content
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">LinkedIn Automation</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Start with 5-10 connections per day
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Focus on quality over quantity
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-yellow-500" />
                  Always include a personalized message
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/platform-activation">
                <div className="text-center">
                  <Rocket className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Full Platform Setup</div>
                  <div className="text-sm text-muted-foreground">Complete all activation steps</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/action-plan">
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Execution Roadmap</div>
                  <div className="text-sm text-muted-foreground">Detailed step-by-step plan</div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link href="/revenue-analytics">
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Track Performance</div>
                  <div className="text-sm text-muted-foreground">Monitor revenue & metrics</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
