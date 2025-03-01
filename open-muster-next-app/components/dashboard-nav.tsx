"use client"

import type React from "react"
import { useEffect, useRef } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, debounce } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Trophy, FileCode, Users, Settings, LogOut } from "lucide-react"

interface DashboardNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardNav({ className, items, ...props }: DashboardNavProps) {
  const pathname = usePathname()
  const isCompany = pathname?.includes("/company")
  const navRef = useRef<HTMLElement>(null)

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

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        // Handle resize if needed
        console.log("DashboardNav resized")
      }, 100),
    )

    if (navRef.current) {
      resizeObserver.observe(navRef.current)
    }

    return () => {
      if (navRef.current) {
        resizeObserver.unobserve(navRef.current)
      }
    }
  }, [])

  return (
    <nav ref={navRef} className={cn("flex flex-col space-y-1", className)} {...props}>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="justify-start"
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
      <Button variant="ghost" className="justify-start text-muted-foreground">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </nav>
  )
}

