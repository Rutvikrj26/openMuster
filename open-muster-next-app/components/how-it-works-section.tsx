export function HowItWorksSection() {
  return (
    <section className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
          <p className="text-muted-foreground md:text-xl">Simple, transparent, and secure bounty workflows</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-bold mb-4">For Companies</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">Connect GitHub & Metamask</p>
                  <p className="text-sm text-muted-foreground">Link your project repository and wallet for payments</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">Create AI-Suggested Bounties</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your code and suggests relevant bounties
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Stake USDC Funds</p>
                  <p className="text-sm text-muted-foreground">Secure your bounty with 125% of the maximum payout</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium">Review & Approve Submissions</p>
                  <p className="text-sm text-muted-foreground">
                    Validated submissions are presented for your final approval
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-xl font-bold mb-4">For Developers</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sign in with GitHub</p>
                  <p className="text-sm text-muted-foreground">
                    We'll calculate your Skill Score based on your activity
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium">Find Matching Bounties</p>
                  <p className="text-sm text-muted-foreground">Filter by your skills, prize amount, or expiry date</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Submit Your Solution</p>
                  <p className="text-sm text-muted-foreground">Upload your GitHub repo link for validation</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-medium">Get Paid in USDC</p>
                  <p className="text-sm text-muted-foreground">
                    Approved submissions automatically release funds to your wallet
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

