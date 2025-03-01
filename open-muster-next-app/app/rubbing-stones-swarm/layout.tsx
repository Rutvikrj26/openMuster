import type { ReactNode } from "react"
import { NavigationBar } from "@/components/rubbing-stones/NavigationBar"

export default function RubbingStonesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

