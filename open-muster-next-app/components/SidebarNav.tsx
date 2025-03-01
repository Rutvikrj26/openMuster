import type React from "react"
import Link from "next/link"
import { ProfileDropdown } from "./ProfileDropdown"
import { WalletConnectButton } from "./WalletConnectButton"
import { Search, Zap, Bell } from "lucide-react"

export const SidebarNav: React.FC = () => {
  return (
    <nav className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Open Muster</h1>
      </div>
      <div className="flex items-center justify-between p-4 border-b">
        <ProfileDropdown />
        <WalletConnectButton />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavItem icon={<Search className="w-5 h-5" />} label="Explore Bounties" href="/bounties" />
        <NavItem icon={<Zap className="w-5 h-5" />} label="Active Projects" href="/projects" />
        <NavItem icon={<Bell className="w-5 h-5" />} label="Notifications" href="/notifications" />
      </div>
    </nav>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  href: string
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href }) => (
  <Link href={href} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
    {icon}
    <span className="ml-3">{label}</span>
  </Link>
)

