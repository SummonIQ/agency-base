'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  BarChart3,
  ListChecks,
  UserCircle,
  Settings,
  PanelLeftClose,
  Menu,
  X,
  HelpCircle,
  Bell,
  LayoutDashboard,
  TrendingUp,
  Zap,
  Grid3X3,
  Target,
  Users,
  Mail,
  Linkedin,
  Calendar,
  Brain,
  BookOpen,
  Building2,
  GitPullRequestDraft,
  Briefcase,
  Rocket,
  Play,
  Send,
  FileText,
  Shield,
  Image,
  DollarSign,
  Receipt,
  Clock,
  Activity,
  ChartBar,
  type LucideIcon,
} from 'lucide-react';

import { HelpButton } from '@/components/onboarding/help-button';
import { NotificationCenter } from '@/components/notifications/notification-center';

import { Button } from '@/components/ui/button';
// Using Popover instead of Sheet for mobile menu
import { Logo } from '@/components/common/logo';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/css';

// Define navigation item type
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  children?: NavItem[];
}

// Define navigation items with icons and descriptions - consolidated structure
const mainNavItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    description: 'View your agency dashboard',
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: <ListChecks className="h-4 w-4" />,
    description: 'Manage tasks and action items',
  },
  {
    name: 'Action Plan',
    href: '/action-plan',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Your business growth roadmap',
  },
  {
    name: 'Growth Tools',
    href: '/business-tools',
    icon: <Zap className="h-4 w-4" />,
    description: 'Lead generation & recruiting',
    children: [
      {
        name: 'All Tools Overview',
        href: '/business-tools',
        icon: <Grid3X3 className="h-4 w-4" />,
        description: 'Complete business toolkit',
      },
      {
        name: 'Lead Generation',
        href: '/lead-generation',
        icon: <Target className="h-4 w-4" />,
        description: 'Find and contact prospects',
      },
      {
        name: 'Recruiting Hub',
        href: '/recruiting',
        icon: <Users className="h-4 w-4" />,
        description: 'Technical recruiting business',
      },
      {
        name: 'Recruiting Dashboard',
        href: '/recruiting-dashboard',
        icon: <Users className="h-4 w-4" />,
        description: 'Candidates, applications & talent pools',
      },
      {
        name: 'Email Automation',
        href: '/email-automation',
        icon: <Mail className="h-4 w-4" />,
        description: 'Automated email sequences',
      },
      {
        name: 'LinkedIn Tools',
        href: '/linkedin-integration',
        icon: <Linkedin className="h-4 w-4" />,
        description: 'LinkedIn automation & sourcing',
      },
      {
        name: 'Execution Calendar',
        href: '/execution-calendar',
        icon: <Calendar className="h-4 w-4" />,
        description: 'Timeline & task management',
      },
      {
        name: 'Business Intelligence',
        href: '/business-intelligence',
        icon: <Brain className="h-4 w-4" />,
        description: 'AI-powered insights & forecasting',
      },
      {
        name: 'Documentation',
        href: '/business-documentation',
        icon: <BookOpen className="h-4 w-4" />,
        description: 'Complete system documentation',
      },
      {
        name: 'API Validation',
        href: '/api-validation',
        icon: <Shield className="h-4 w-4" />,
        description: 'Monitor API integrations & health',
      },
      {
        name: 'API Setup',
        href: '/api-setup',
        icon: <Settings className="h-4 w-4" />,
        description: 'Configure API keys & integrations',
      },
      {
        name: 'Automation Sequences',
        href: '/automation-sequences',
        icon: <Zap className="h-4 w-4" />,
        description: 'Multi-channel automation workflows',
      },
      {
        name: 'Email Marketing',
        href: '/email-marketing',
        icon: <Mail className="h-4 w-4" />,
        description: 'Campaigns, subscribers & analytics',
      },
    ],
  },
  {
    name: 'CRM',
    href: '/clients',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Clients, leads & projects',
    children: [
      {
        name: 'Clients',
        href: '/clients',
        icon: <Building2 className="h-4 w-4" />,
        description: 'Manage client relationships',
      },
      {
        name: 'Leads',
        href: '/leads',
        icon: <GitPullRequestDraft className="h-4 w-4" />,
        description: 'Track opportunities & pipeline',
      },
      {
        name: 'Getting Started',
        href: '/getting-started',
        icon: <Play className="h-4 w-4" />,
        description: 'Quick wins to start generating revenue',
      },
      {
        name: 'Platform Activation',
        href: '/platform-activation',
        icon: <Rocket className="h-4 w-4" />,
        description: 'Complete setup & start generating revenue',
      },
      {
        name: 'Action Plan',
        href: '/action-plan',
        icon: <Target className="h-4 w-4" />,
        description: 'Step-by-step execution roadmap',
      },
      {
        name: 'Projects',
        href: '/projects',
        icon: <Briefcase className="h-4 w-4" />,
        description: 'Manage active projects',
      },
      {
        name: 'Outreach',
        href: '/outreach',
        icon: <Send className="h-4 w-4" />,
        description: 'Client outreach management',
      },
      {
        name: 'Proposals',
        href: '/proposals',
        icon: <FileText className="h-4 w-4" />,
        description: 'Create and manage proposals',
      },
      {
        name: 'Contracts',
        href: '/contracts',
        icon: <Shield className="h-4 w-4" />,
        description: 'Signed contracts and agreements',
      },
      {
        name: 'Portfolio',
        href: '/portfolio',
        icon: <Image className="h-4 w-4" />,
        description: 'Showcase your work',
      },
    ],
  },
  {
    name: 'Finance',
    href: '/invoices',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Billing & analytics',
    children: [
      {
        name: 'Invoices',
        href: '/invoices',
        icon: <Receipt className="h-4 w-4" />,
        description: 'Create and manage invoices',
      },
      {
        name: 'Time Tracking',
        href: '/time-tracking',
        icon: <Clock className="h-4 w-4" />,
        description: 'Track time spent on projects',
      },
      {
        name: 'Analytics Overview',
        href: '/analytics',
        icon: <Activity className="h-4 w-4" />,
        description: 'Business metrics overview',
      },
      {
        name: 'Revenue Analytics',
        href: '/revenue-analytics',
        icon: <TrendingUp className="h-4 w-4" />,
        description: 'Business performance tracking',
      },
      {
        name: 'Analytics Dashboard',
        href: '/analytics/dashboard',
        icon: <ChartBar className="h-4 w-4" />,
        description: 'Detailed analytics dashboard',
      },
    ],
  },
];

const profileNavItems: NavItem[] = [
  {
    name: 'Profile',
    href: '/profile',
    icon: <UserCircle className="h-4 w-4" />,
    description: 'Manage your profile',
    children: [
      {
        name: 'Account',
        href: '/profile',
        icon: <UserCircle className="h-4 w-4" />,
        description: 'View and edit your account details',
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: <Settings className="h-4 w-4" />,
        description: 'Configure your preferences',
      },
    ],
  },
];

export default function TopNavigation({ userId }: { userId?: string } = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string, exact: boolean = false) => {
    if (exact && pathname === path) {
      return true;
    }

    if (!exact && pathname.includes(path)) {
      return true;
    }

    return undefined;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <nav
        aria-label="Global"
        className="responsive center flex items-center justify-between py-4"
      >
          <div className="flex lg:flex-1">
            <Link href="/dashboard" className="-m-1.5 p-1.5">
              <span className="sr-only">AgencyBase</span>
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label="Open main menu"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-screen h-[calc(100vh-4rem)] p-0 mt-0 border-t-0 rounded-none rounded-b-lg right-0 left-0 backdrop-blur-xl bg-background/80"
                id="mobile-menu"
                role="menu"
                aria-label="Main navigation menu"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="-m-1.5 p-1.5"
                  >
                    <Logo className="h-8 w-auto" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <HelpButton />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <div className="divide-y divide-border">
                    <div className="space-y-2 py-6">
                      {mainNavItems.map(item =>
                        item.children ? (
                          <div key={item.name} className="mb-4">
                            <div className="flex items-center px-3 py-2 text-base font-semibold">
                              {item.icon}
                              {item.name}
                            </div>
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children.map(child => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    '-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium hover:bg-accent',
                                    isActive(child.href)
                                      ? 'text-primary font-semibold'
                                      : 'text-muted-foreground',
                                  )}
                                >
                                  {child.icon}
                                  <div>
                                    <div>{child.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {child.description}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-x-3 rounded-lg px-3 py-2 text-base font-medium hover:bg-accent',
                              isActive(item.href)
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground',
                            )}
                          >
                            {item.icon}
                            <div>
                              <div>{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ),
                      )}
                    </div>

                    <div className="py-6">
                      {/* Profile Navigation */}
                      {profileNavItems.map(item => (
                        <div key={item.name}>
                          <div className="flex items-center px-3 py-2 text-base font-semibold">
                            {item.icon}
                            {item.name}
                          </div>
                          {item.children && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children.map(child => (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    '-mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium hover:bg-accent',
                                    isActive(child.href)
                                      ? 'text-primary font-semibold'
                                      : 'text-muted-foreground',
                                  )}
                                >
                                  {child.icon}
                                  <div>
                                    <div>{child.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {child.description}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Desktop navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="flex-row">
              {mainNavItems.map(item =>
                item.children ? (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuTrigger data-active={isActive(item.href)}>
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-[400px] space-y-2 p-3">
                        {item.children.map(child => (
                          <li key={child.name}>
                            <NavigationMenuLink
                              href={child.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              data-active={isActive(child.href)}
                            >
                              <div className="flex gap-2">
                                <div>
                                  {child.icon}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium leading-none">
                                    {child.name}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {child.description}
                                  </p>
                                </div>
                              </div>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      data-active={isActive(item.href, true)}
                      href={item.href}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Profile section */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
            {/* Notification Center */}
            {userId && <NotificationCenter userId={userId} />}
            {/* Help Button */}
            <HelpButton />
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger data-active={isActive('/profile')}>
                    <UserCircle className="h-5 w-5 mr-1" />
                    Profile
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="absolute right-0 left-auto">
                    <ul className="w-[320px] space-y-2 p-2 pb-2.5 pr-2.5">
                      {profileNavItems[0].children.map(item => (
                        <li key={item.name}>
                          <NavigationMenuLink
                            href={item.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            data-active={isActive(item.href)}
                          >
                            <div className="flex gap-2">
                              <div>
                                {item.icon}
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-medium leading-none">
                                  {item.name}
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      <li>
                        <NavigationMenuLink
                          href="/logout"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="flex gap-2">
                            <div>
                              <Settings className="mr-2 size-6" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium leading-none">
                                Log out
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Sign out of your account
                              </p>
                            </div>
                          </div>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </nav>
    </header>
  );
}
