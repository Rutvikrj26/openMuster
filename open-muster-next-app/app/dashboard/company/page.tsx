"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardNav } from "@/components/dashboard-nav"
import { BountyList } from "@/components/bounty-list"
import { CompanyStats } from "@/components/company-stats"
import { RubbingStones } from "@/components/rubbing-stones"

export default function CompanyDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl text-neon-blue">
              Open Muster
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/bounties" className="text-sm font-medium hover:text-neon-blue">
              Explore Bounties
            </Link>
            <RubbingStones />
            <Button
              variant="outline"
              size="sm"
              className="bg-card text-neon-pink border-neon-pink hover:bg-neon-pink hover:text-black"
            >
              <Link href="/dashboard/company/create-bounty">Create Bounty</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-card text-neon-green border-neon-green hover:bg-neon-green hover:text-black"
            >
              <Link href="/rubbing-stones-swarm">Rubbing Stones Swarm AI</Link>
            </Button>
            <div className="h-8 w-8 rounded-full bg-neon-green"></div>
          </nav>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <DashboardNav className="hidden md:block" />
        <main className="flex w-full flex-col overflow-hidden py-6">
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
              <p className="text-muted-foreground">Manage your bounties and track developer submissions</p>
            </div>
            <CompanyStats />
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Active Bounties</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="space-y-4">
                <BountyList
                  bounties={[
                    {
                      id: "1",
                      title: "Implement Smart Contract for Token Staking",
                      description:
                        "Create a Solidity smart contract that allows users to stake ERC-20 tokens and earn rewards.",
                      prize: 500,
                      submissions: 0,
                      expiresIn: "5 days",
                      status: "active",
                    },
                    {
                      id: "2",
                      title: "Build React Component for Wallet Connection",
                      description:
                        "Create a reusable React component that handles wallet connection with Metamask and other providers.",
                      prize: 300,
                      submissions: 2,
                      expiresIn: "2 days",
                      status: "active",
                    },
                  ]}
                />
              </TabsContent>
              <TabsContent value="pending" className="space-y-4">
                <BountyList
                  bounties={[
                    {
                      id: "3",
                      title: "Optimize Gas Usage in NFT Contract",
                      description:
                        "Refactor our existing NFT contract to reduce gas costs during minting and transfers.",
                      prize: 750,
                      submissions: 3,
                      expiresIn: "1 day",
                      status: "pending",
                    },
                  ]}
                />
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <BountyList
                  bounties={[
                    {
                      id: "4",
                      title: "Create API Integration for Token Prices",
                      description:
                        "Build a backend service that fetches and caches token prices from multiple exchanges.",
                      prize: 400,
                      submissions: 1,
                      completedDate: "2 days ago",
                      status: "completed",
                    },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

