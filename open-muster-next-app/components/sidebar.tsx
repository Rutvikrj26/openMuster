"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Trophy, FileCode, Users, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function AppSidebar({ className, items, ...props }: SidebarProps) {
  const pathname = usePathname()
  const isCompany = pathname?.includes("/company")

  const defaultItems = isCompany
    ? [
        {
          href: "/dashboard/company",
          title: "Overview",
          icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/company/bounties",
          title: "My Bounties",
          icon: <Trophy className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/company/submissions",
          title: "Submissions",
          icon: <FileCode className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/company/developers",
          title: "Developers",
          icon: <Users className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/company/settings",
          title: "Settings",
          icon: <Settings className="mr-2 h-4 w-4" />,
        },
      ]
    : [
        {
          href: "/dashboard/developer",
          title: "Overview",
          icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/developer/bounties",
          title: "Find Bounties",
          icon: <Trophy className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/developer/submissions",
          title: "My Submissions",
          icon: <FileCode className="mr-2 h-4 w-4" />,
        },
        {
          href: "/dashboard/developer/settings",
          title: "Settings",
          icon: <Settings className="mr-2 h-4 w-4" />,
        },
      ]

  const navItems = items || defaultItems

  return (
    <Sidebar className={cn("bg-card text-card-foreground", className)} {...props}>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-neon-blue" />
          <span className="text-lg font-bold text-neon-blue">Open Muster</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full justify-start">
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild variant="ghost" className="w-full justify-start text-muted-foreground">
              <button>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

