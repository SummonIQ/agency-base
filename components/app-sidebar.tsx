"use client"

import * as React from "react"
import {
  BookOpen,
  Command,
  Settings2,
  SquareTerminal,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Calendar,
  Mail,
  Database,
  Linkedin,
  Brain,
  Building,
  Briefcase,
  TrendingUp,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Agency User",
    email: "user@agency.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Business Strategy",
      url: "/business-tools",
      icon: Target,
      items: [
        {
          title: "Action Plan",
          url: "/action-plan",
        },
        {
          title: "Execution Calendar",
          url: "/execution-calendar",
        },
        {
          title: "Business Tools Hub",
          url: "/business-tools",
        },
        {
          title: "Documentation",
          url: "/business-documentation",
        },
      ],
    },
    {
      title: "Lead Generation",
      url: "/lead-generation",
      icon: Users,
      items: [
        {
          title: "Lead Generation Suite",
          url: "/lead-generation",
        },
        {
          title: "Agency Leads CRM",
          url: "/agency-leads",
        },
        {
          title: "Lead Data Integration",
          url: "/lead-data-integration",
        },
      ],
    },
    {
      title: "Recruiting Business",
      url: "/recruiting",
      icon: Briefcase,
      items: [
        {
          title: "Recruiting Platform",
          url: "/recruiting",
        },
        {
          title: "Network Mapping",
          url: "/recruiting/network-mapping",
        },
        {
          title: "Job Requisitions",
          url: "/recruiting/jobs/new",
        },
        {
          title: "Candidate Assessment",
          url: "/recruiting/candidates/assess",
        },
        {
          title: "Fee Calculator",
          url: "/recruiting/fee-calculator",
        },
        {
          title: "Client Portal",
          url: "/client-portal",
        },
      ],
    },
    {
      title: "Automation",
      url: "/email-automation",
      icon: Mail,
      items: [
        {
          title: "Workflow Automation",
          url: "/workflow-automation",
        },
        {
          title: "Email Automation",
          url: "/email-automation",
        },
        {
          title: "LinkedIn Integration",
          url: "/linkedin-integration",
        },
      ],
    },
    {
      title: "Analytics & Intelligence",
      url: "/revenue-analytics",
      icon: BarChart3,
      items: [
        {
          title: "Revenue Analytics",
          url: "/revenue-analytics",
        },
        {
          title: "Business Intelligence",
          url: "/business-intelligence",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings",
        },
        {
          title: "API Integrations",
          url: "/settings/integrations",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
        {
          title: "Appearance",
          url: "/settings/appearance",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Business Documentation",
      url: "/business-documentation",
      icon: BookOpen,
    },
  ],
  projects: [
    {
      name: "Quick Actions",
      url: "/action-plan",
      icon: Target,
    },
    {
      name: "Today's Tasks",
      url: "/execution-calendar",
      icon: Calendar,
    },
    {
      name: "Revenue Pipeline",
      url: "/revenue-analytics",
      icon: TrendingUp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">AgencyBase</span>
                  <span className="truncate text-xs">Agency Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
