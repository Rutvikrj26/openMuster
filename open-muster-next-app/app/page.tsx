import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { HowItWorksSection } from "@/components/how-it-works-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">Open Muster</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/bounties" className="text-sm font-medium hover:underline">
              Explore Bounties
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline">
              About
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <HeroSection />
        <FeatureSection />
        <HowItWorksSection />
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Open Muster. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

