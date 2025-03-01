import { Shield, Code, Zap } from "lucide-react"

export function FeatureSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Escrow</h3>
            <p className="text-muted-foreground">
              All bounties are backed by 125% USDC escrow on Polygon, ensuring developers always get paid.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI-Powered Bounties</h3>
            <p className="text-muted-foreground">
              Our AI analyzes your codebase to suggest relevant bounties that fill actual gaps in your project.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Hybrid Validation</h3>
            <p className="text-muted-foreground">
              Submissions are validated through AI analysis, static code checks, and peer review for quality assurance.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

