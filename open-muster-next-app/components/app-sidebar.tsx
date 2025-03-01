"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, FileText, Send, Users, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
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

export function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const isCompany = pathname?.includes("/company")

  const menuItems = isCompany
    ? [
        { href: "/company", label: "Overview", icon: LayoutDashboard },
        { href: "/company/bounties", label: "Bounty Listings", icon: FileText },
        { href: "/company/submissions", label: "Submissions", icon: Send },
        { href: "/company/developers", label: "Developers", icon: Users },
      ]
    : [
        { href: "/user", label: "Overview", icon: LayoutDashboard },
        { href: "/user/bounties", label: "My Bounties", icon: FileText },
        { href: "/user/submissions", label: "Submissions", icon: Send },
      ]

  return (
    <Sidebar className="w-64 bg-card">
      <SidebarHeader className="p-4">
        <h2 className="text-2xl font-bold text-neon-blue">Open Muster</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} className="w-full justify-start">
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
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
            <SidebarMenuButton variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

