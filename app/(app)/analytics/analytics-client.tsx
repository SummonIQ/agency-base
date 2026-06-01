'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnalyticsOverview } from '@/components/analytics/overview';
import { JobLeadMetrics } from '@/components/analytics/job-lead-metrics';
import { ResumeMetrics } from '@/components/analytics/resume-metrics';
import { JobSearchMetrics } from '@/components/analytics/job-search-metrics';
import { JobSearchPerformanceDashboard } from '@/components/analytics/job-search-performance-dashboard';
import { InterviewPerformanceTracker } from '@/components/analytics/interview-performance-tracker';
import { ApplicationTimingAnalytics } from '@/components/analytics/application-timing-analytics';
import { SkillsGapAnalysis } from '@/components/analytics/skills-gap-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/css';
import { 
  ArrowRight, 
  BarChart3, 
  Clock, 
  Target, 
  Brain,
  Home,
  Briefcase,
  FileText,
  Search,
  Users,
  Activity,
  TrendingUp
} from 'lucide-react';

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    description: 'High-level metrics and insights',
  },
  {
    id: 'job-leads',
    label: 'Job Applications',
    icon: Briefcase,
    description: 'Application status and tracking',
    hasDetailedView: true,
    detailLink: '/analytics/applications',
  },
  {
    id: 'resumes',
    label: 'Resume Performance',
    icon: FileText,
    description: 'Resume optimization and scores',
  },
  {
    id: 'job-searches',
    label: 'Job Searches',
    icon: Search,
    description: 'Search effectiveness metrics',
  },
  {
    id: 'interviews',
    label: 'Interview Performance',
    icon: Users,
    description: 'Interview success tracking',
  },
  {
    id: 'timing',
    label: 'Application Timing',
    icon: Clock,
    description: 'Best times to apply',
  },
  {
    id: 'skills',
    label: 'Skills Gap Analysis',
    icon: Brain,
    description: 'Skills improvement insights',
  },
  {
    id: 'performance',
    label: 'Search Performance',
    icon: Activity,
    description: 'Comprehensive search analytics',
  },
];

export function AnalyticsClient() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <AnalyticsOverview />;
      case 'job-leads':
        return (
          <div className="space-y-4">
            <div className="mb-4 flex items-center justify-end">
              <Link href="/analytics/applications">
                <Button variant="outline" size="sm">
                  View Detailed Application Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Application Status Distribution</CardTitle>
                  <CardDescription>
                    Track the status of your job applications over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobLeadMetrics />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Top Companies</CardTitle>
                  <CardDescription>
                    Companies you've applied to most frequently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobLeadMetrics type="companies" />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'resumes':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Resume Optimization Scores</CardTitle>
                <CardDescription>
                  Track improvements in your resume optimization scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeMetrics />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Resumes</CardTitle>
                <CardDescription>
                  Resumes with the highest optimization scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeMetrics type="top-performing" />
              </CardContent>
            </Card>
          </div>
        );
      case 'job-searches':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Search Success Rate</CardTitle>
                <CardDescription>
                  Performance of your job searches over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobSearchMetrics />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Search Terms</CardTitle>
                <CardDescription>
                  Most frequently used search terms and their effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobSearchMetrics type="search-terms" />
              </CardContent>
            </Card>
          </div>
        );
      case 'interviews':
        return <InterviewPerformanceTracker />;
      case 'timing':
        return <ApplicationTimingAnalytics />;
      case 'skills':
        return <SkillsGapAnalysis />;
      case 'performance':
        return <JobSearchPerformanceDashboard />;
      default:
        return <AnalyticsOverview />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Navigation */}
      <div className="w-72 border-r bg-background">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your job search performance
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-lg px-4 py-3 text-sm transition-all",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className={cn(
                        "mt-0.5 h-5 w-5 transition-colors",
                        isActive ? "text-primary" : ""
                      )} />
                      <div className="flex-1 text-left">
                        <div className={cn(
                          "font-medium transition-colors",
                          isActive ? "text-foreground" : ""
                        )}>
                          {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      {item.hasDetailedView && (
                        <ArrowRight className="mt-0.5 h-4 w-4 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <Link href="/analytics/dashboard">
              <Button variant="outline" className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                View All Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {navigationItems.find(item => item.id === activeSection)?.label}
            </h1>
            <p className="text-muted-foreground mt-2">
              {navigationItems.find(item => item.id === activeSection)?.description}
            </p>
          </div>
          <div className="max-w-[1600px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}