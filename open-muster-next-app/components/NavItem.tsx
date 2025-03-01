"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItemProps {
  icon: string
  label: string
  link: string
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, link }) => {
  const pathname = usePathname()
  const isActive = pathname === link

  return (
    <Link
      href={link}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
        isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white",
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

