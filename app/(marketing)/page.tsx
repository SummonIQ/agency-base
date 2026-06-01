import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import {
  Building2,
  Target,
  FolderOpen,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle2,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Briefcase,
  Calendar,
  Mail
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/css';

import { ResponsiveContainer } from './layouts/ResponsiveContainer';

export const metadata: Metadata = {
  description:
    'The all-in-one agency management platform. Streamline client relationships, track projects, manage proposals, and grow your agency—all in one place.',
  title: 'AgencyBase - The Complete Agency Management Platform',
};

const features = [
  {
    icon: Building2,
    title: 'Client Management',
    description: 'Build lasting relationships with comprehensive client profiles, communication history, and project tracking.',
  },
  {
    icon: FolderOpen,
    title: 'Project Tracking',
    description: 'Manage projects from start to finish with Kanban boards, milestones, and real-time progress updates.',
  },
  {
    icon: Target,
    title: 'Lead Pipeline',
    description: 'Track leads through your sales funnel with drag-and-drop pipeline boards and automated follow-ups.',
  },
  {
    icon: FileText,
    title: 'Proposals & Contracts',
    description: 'Create professional proposals with templates, send for approval, and track contract status effortlessly.',
  },
  {
    icon: DollarSign,
    title: 'Invoicing',
    description: 'Generate invoices, track payments, and manage revenue with automated billing and payment reminders.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Allocate resources, track team availability, and monitor productivity across all your projects.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Log billable hours, track project time, and generate timesheets for accurate client billing.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Get insights on revenue, client acquisition, project performance, and team productivity.',
  },
];

const benefits = [
  'Stop juggling multiple tools and spreadsheets',
  'Win more clients with professional proposals',
  'Never miss a deadline or follow-up',
  'Get paid faster with automated invoicing',
  'Scale your agency without the chaos',
  'Make data-driven decisions with analytics',
];

const stats = [
  { label: 'Time Saved', value: '15+ hrs/week', subtext: 'per team member' },
  { label: 'Faster Proposals', value: '3x', subtext: 'compared to manual' },
  { label: 'Client Satisfaction', value: '94%', subtext: 'improved communication' },
  { label: 'Revenue Growth', value: '2x', subtext: 'in first year' },
];

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 py-20 md:py-32">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

        <ResponsiveContainer className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Zap className="mr-1.5 h-3 w-3" />
              Now in Beta - Join Early Adopters
            </Badge>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
              Run Your Agency
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
              The all-in-one platform to manage clients, track projects, send proposals,
              and grow your agency—without the spreadsheet chaos.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="gap-2 text-base">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-base">
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              No credit card required • Free forever plan available
            </p>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-200 bg-white px-6 py-16">
        <ResponsiveContainer className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-slate-900 md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-slate-600">
                  {stat.label}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>
        </ResponsiveContainer>
      </section>

      {/* Problem/Solution Section */}
      <section className="bg-slate-50 px-6 py-20 md:py-28">
        <ResponsiveContainer className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                Stop Drowning in Spreadsheets
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Running an agency shouldn't mean juggling a dozen tools, losing track of
                client conversations, or chasing down payments.
              </p>
              <div className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20 blur-2xl" />
                <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="h-3 w-32 rounded bg-slate-200" />
                        <div className="mt-2 h-2 w-24 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                      <div className="h-2 rounded bg-slate-200" />
                      <div className="h-2 w-4/5 rounded bg-slate-200" />
                      <div className="h-2 w-3/5 rounded bg-slate-200" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 flex-1 rounded bg-blue-600 opacity-80" />
                      <div className="h-8 flex-1 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Features Grid */}
      <section id="features" className="scroll-mt-20 bg-white px-6 py-20 md:py-28">
        <ResponsiveContainer className="mx-auto max-w-6xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Everything You Need in One Place
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful tools designed specifically for agencies
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ResponsiveContainer>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-20 bg-slate-50 px-6 py-20 md:py-28">
        <ResponsiveContainer className="mx-auto max-w-6xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Get Started in Minutes
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Add Your Clients
              </h3>
              <p className="mt-2 text-slate-600">
                Import or manually add client information, contacts, and project history
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Create Projects
              </h3>
              <p className="mt-2 text-slate-600">
                Set up projects, assign team members, and track progress with our intuitive boards
              </p>
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Grow Your Agency
              </h3>
              <p className="mt-2 text-slate-600">
                Win more deals with proposals, get paid faster, and scale with confidence
              </p>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-20 md:py-28">
        <ResponsiveContainer className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Transform Your Agency?
          </h2>
          <p className="mt-6 text-lg text-blue-100 md:text-xl">
            Join hundreds of agencies who have streamlined their operations with AgencyBase.
            Start your free trial today—no credit card required.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="gap-2 text-base">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                Schedule a Demo
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>24/7 support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
          </div>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
