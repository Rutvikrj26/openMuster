"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Bot, Zap, BarChart3, ArrowLeft } from "lucide-react"

const navItems = [
  { href: "/rubbing-stones-swarm", label: "Landing Page", icon: Home },
  { href: "/rubbing-stones-swarm/provisioning", label: "Bot Provisioning", icon: Bot },
  { href: "/rubbing-stones-swarm/orchestration", label: "Swarm Orchestration", icon: Zap },
  { href: "/rubbing-stones-swarm/analytics", label: "Analytics", icon: BarChart3 },
]

export function NavigationBar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-10 w-full bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/open-muster" className="mr-6">
              <Button variant="ghost" size="sm" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open Muster
              </Button>
            </Link>
            <Link href="/rubbing-stones-swarm" className="text-2xl font-bold text-primary">
              Rubbing Stones
            </Link>
          </div>
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn("flex items-center", pathname === item.href && "bg-muted")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
          <div className="md:hidden">
            {/* Implement mobile menu here */}
            <Button variant="outline">Menu</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

