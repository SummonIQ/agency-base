'use client';

import type { User } from '@prisma/client';
import {
  BriefcaseBusiness,
  Command,
  Target,
  UserCircle,
  // Settings2,
  // SquareTerminal,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type * as React from 'react';
import { TbTools } from 'react-icons/tb';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import { UserMenu } from '@/components/user/user-menu';
import { Logo } from '@/components/common/logo';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppSidebar({
  appliedJobLeadsCount = 0,
  dismissedCount = 0,
  jobListingsCount = 0,
  jobSearchesCount = 0,
  leadsCount = 0,
  savedCount = 0,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  appliedJobLeadsCount?: number;
  dismissedCount?: number;
  jobListingsCount?: number;
  jobSearchesCount?: number;
  leadsCount?: number;
  savedCount?: number;
  user: Omit<User, 'password'>;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { openMobile, setOpenMobile } = useSidebar();
  const navigationItems = [
    {
      icon: Command,
      isActive: pathname === '/dashboard',
      title: 'Overview',
      url: '/dashboard',
    },
    {
      icon: BriefcaseBusiness,
      isActive: pathname.startsWith('/jobs'),
      items: [
        {
          title: `All (${jobListingsCount})`,
          url: '/jobs',
        },

        // {
        //   title: 'Queued',
        //   url: '/jobs/queued',
        // },
        // {
        //   title: 'Applied',
        //   url: '/jobspplied',
        // },
        {
          title: `Saved (${savedCount})`,
          url: '/jobs/saved',
        },
        {
          title: `Dismissed (${dismissedCount})`,
          url: '/jobs/dismissed',
        },
        {
          title: `Searches (${jobSearchesCount})`,
          url: '/jobs/searches',
        },
      ],
      title: 'Jobs',
      url: '/jobs',
    },
    {
      icon: Target,
      isActive: pathname.startsWith('/leads'),
      items: [
        {
          title: `All (${leadsCount})`,
          url: '/leads',
        },
        {
          title: `Applied (${appliedJobLeadsCount})`,
          url: '/leads/applied',
        },
      ],
      title: `Job Leads (${leadsCount})`,
      url: '/leads',
    },
    {
      icon: TbTools,
      isActive: pathname.startsWith('/tools'),
      items: [
        {
          isActive: pathname.startsWith('/tools/ats-optimizer'),
          title: 'ATS Optimizer',
          url: '/tools/ats-optimizer',
        },
        {
          isActive: pathname.startsWith('/tools/job-details-optimizer'),
          title: 'Job Details Optimizer',
          url: '/tools/job-details-optimizer',
        },
        {
          isActive: pathname.startsWith('/tools/automation'),
          title: 'Application Automation',
          url: '/tools/automation',
        },
      ],
      title: 'Tools',
      url: '/tools',
    },
    {
      icon: UserCircle,
      isActive: pathname.startsWith('/profile'),
      items: [
        {
          title: 'My Details',
          url: '/profile',
        },
        {
          title: 'Manage Resumes',
          url: '/profile/resumes',
        },
        {
          title: 'Job Preferences',
          url: '/profile/job-preferences',
        },
      ],
      title: 'Profile',
      url: '/profile',
    },

    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ];
  return (
    <Sidebar side="left" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="overflow-visible" 
              size="lg"
              onClick={() => isMobile && setOpenMobile(false)}
            >
              <Link href="/dashboard">
                <Logo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter className="mt-auto pb-4">
        <UserMenu
          user={{
            email: user.email,
            image: user.image ?? '/images/avatar.png',
            name: `${user.firstName} ${user.lastName}`,
          }}
          className="w-full px-2"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
