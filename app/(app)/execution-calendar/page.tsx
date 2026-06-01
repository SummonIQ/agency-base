'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  Target, 
  DollarSign, 
  Users, 
  Mail, 
  Phone,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'execution' | 'setup' | 'outreach' | 'technical';
  deadline: string;
  completed: boolean;
  revenue_impact: string;
}

interface WeeklyGoal {
  week: string;
  goal: string;
  revenue_target: string;
  key_metrics: string[];
}

export default function ExecutionCalendar() {
  const [tasks, setTasks] = useState<Task[]>([
    // TODAY - Critical Execution
    {
      id: 'net-map-1',
      title: 'Network Mapping - First 20 Contacts',
      description: 'Add 20 contacts to network mapping tool: former colleagues, current clients, industry connections',
      timeEstimate: '2 hours',
      priority: 'critical',
      category: 'execution',
      deadline: 'Today',
      completed: false,
      revenue_impact: 'Direct - 70-80% response rate expected'
    },
    {
      id: 'warm-email-1',
      title: 'Send First 3 Warm Recruiting Emails',
      description: 'Draft and send recruiting emails to strongest network connections using templates',
      timeEstimate: '1 hour',
      priority: 'critical',
      category: 'outreach',
      deadline: 'Today',
      completed: false,
      revenue_impact: 'Direct - Potential $15-30K contracts'
    },
    {
      id: 'client-check',
      title: 'Contact 3 Current Clients About Hiring',
      description: 'Reach out to existing agency clients about their hiring needs and recruiting services',
      timeEstimate: '30 minutes',
      priority: 'critical',
      category: 'outreach',
      deadline: 'Today',
      completed: false,
      revenue_impact: 'Direct - Warm leads with existing trust'
    },

    // THIS WEEK - High Priority Setup
    {
      id: 'sendgrid-setup',
      title: 'Configure SendGrid Email Automation',
      description: 'Set up SendGrid account, configure email templates, tracking, and automation sequences',
      timeEstimate: '3 hours',
      priority: 'high',
      category: 'technical',
      deadline: 'This Week',
      completed: false,
      revenue_impact: 'Scalability - Enables automated outreach'
    },
    {
      id: 'linkedin-setup',
      title: 'Set Up LinkedIn Recruiter Lite Account',
      description: 'Subscribe to LinkedIn Recruiter Lite ($140/month), configure search filters, save searches',
      timeEstimate: '2 hours',
      priority: 'high',
      category: 'setup',
      deadline: 'This Week',
      completed: false,
      revenue_impact: 'Critical - Primary candidate sourcing tool'
    },
    {
      id: 'net-map-complete',
      title: 'Complete Network Mapping (50+ contacts)',
      description: 'Add remaining 30+ contacts to reach 50+ total professional network contacts',
      timeEstimate: '2 hours',
      priority: 'high',
      category: 'execution',
      deadline: 'This Week',
      completed: false,
      revenue_impact: 'Direct - Larger outreach pool'
    },

    // WEEK 2 - Scale and Optimize
    {
      id: 'apollo-setup',
      title: 'Integrate Apollo.io Lead Data API',
      description: 'Set up Apollo.io account, configure API integration, test lead enrichment',
      timeEstimate: '4 hours',
      priority: 'high',
      category: 'technical',
      deadline: 'Week 2',
      completed: false,
      revenue_impact: 'Scalability - Automated lead discovery'
    },
    {
      id: 'cold-outreach-1',
      title: 'Launch First Cold Email Campaign',
      description: 'Send 50 cold emails to prospects using lead data and email automation',
      timeEstimate: '2 hours',
      priority: 'medium',
      category: 'outreach',
      deadline: 'Week 2',
      completed: false,
      revenue_impact: 'Direct - 10-15% response rate expected'
    },
    {
      id: 'linkedin-outreach',
      title: 'LinkedIn Candidate Sourcing Campaign',
      description: 'Use LinkedIn Recruiter to source 20 candidates for active job requisitions',
      timeEstimate: '3 hours',
      priority: 'medium',
      category: 'execution',
      deadline: 'Week 2',
      completed: false,
      revenue_impact: 'Direct - Candidate pipeline for placements'
    }
  ]);

  const weeklyGoals: WeeklyGoal[] = [
    {
      week: 'Week 1 (This Week)',
      goal: 'Execute Network Outreach & Setup Core Tools',
      revenue_target: '5-10 warm responses, 2-3 meetings scheduled',
      key_metrics: ['20+ network contacts mapped', '5+ warm emails sent', '3 client conversations', 'Email automation live']
    },
    {
      week: 'Week 2',
      goal: 'Scale Outreach & Build Candidate Pipeline',
      revenue_target: '3-5 qualified meetings, first contract discussions',
      key_metrics: ['50+ cold emails sent', '20 candidates sourced', 'LinkedIn automation active', 'Lead data API integrated']
    },
    {
      week: 'Week 3-4',
      goal: 'Convert Meetings to Contracts',
      revenue_target: 'First contract signed ($15-30K value)',
      key_metrics: ['5+ client meetings held', '2-3 proposals sent', '1+ contract signed', 'Candidate interviews scheduled']
    },
    {
      week: 'Month 2',
      goal: 'Scale Operations & Optimize',
      revenue_target: '$15-30K in signed contracts',
      key_metrics: ['Multiple active job orders', 'Candidate placements in progress', 'Automated systems running', 'Revenue tracking live']
    }
  ];

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'execution': return <Target className="h-4 w-4" />;
      case 'setup': return <Zap className="h-4 w-4" />;
      case 'outreach': return <Mail className="h-4 w-4" />;
      case 'technical': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const todayTasks = tasks.filter(task => task.deadline === 'Today');
  const thisWeekTasks = tasks.filter(task => task.deadline === 'This Week');
  const upcomingTasks = tasks.filter(task => !['Today', 'This Week'].includes(task.deadline));

  const completedCount = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Business Execution Calendar
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your step-by-step roadmap to launch and scale your recruiting & lead generation business
          </p>
          
          {/* Progress Overview */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-lg font-semibold">{completedCount}/{totalTasks} Tasks Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-lg font-semibold">{completionRate}% Progress</span>
            </div>
          </div>
        </div>

        {/* Weekly Goals Overview */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Weekly Goals & Revenue Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="bg-card p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{goal.week}</h3>
                  <p className="text-sm text-foreground mb-2">{goal.goal}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">{goal.revenue_target}</span>
                  </div>
                  <div className="space-y-1">
                    {goal.key_metrics.map((metric, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
                        {metric}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Critical Tasks */}
        <Card className="border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              TODAY - Critical Execution Tasks
              <Badge variant="destructive">URGENT</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These tasks have the highest revenue impact and should be completed today
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayTasks.map((task) => (
                <div key={task.id} className="bg-card p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(task.category)}
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{task.timeEstimate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300 font-medium">{task.revenue_impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* This Week Tasks */}
        <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-orange-600" />
              THIS WEEK - High Priority Setup
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Essential infrastructure and scaling tasks to complete this week
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {thisWeekTasks.map((task) => (
                <div key={task.id} className="bg-card p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(task.category)}
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{task.timeEstimate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300 font-medium">{task.revenue_impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              UPCOMING - Scale & Optimize
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Next phase tasks to scale operations and optimize performance
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="bg-card p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(task.category)}
                        <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{task.deadline}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{task.timeEstimate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300 font-medium">{task.revenue_impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-green-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Network Mapping</span>
                <span className="text-xs text-gray-600">Add contacts</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Mail className="h-6 w-6" />
                <span>Send Emails</span>
                <span className="text-xs text-gray-600">Warm outreach</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <Phone className="h-6 w-6" />
                <span>Client Calls</span>
                <span className="text-xs text-gray-600">Check hiring needs</span>
              </Button>
              <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>Track Progress</span>
                <span className="text-xs text-gray-600">Update metrics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
