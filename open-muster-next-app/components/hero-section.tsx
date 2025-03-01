import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Connect. Build. Earn.
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              The decentralized platform connecting companies with developers through blockchain-secured bounties.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth?type=company">
              <Button size="lg" className="gap-2">
                Post a Bounty
              </Button>
            </Link>
            <Link href="/auth?type=developer">
              <Button size="lg" variant="outline" className="gap-2">
                Find Work
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

