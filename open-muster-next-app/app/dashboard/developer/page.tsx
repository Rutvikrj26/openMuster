"use client"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardNav } from "@/components/dashboard-nav"
import { BountyList } from "@/components/bounty-list"
import { DeveloperStats } from "@/components/developer-stats"
import { Badge } from "@/components/ui/badge"

export default function DeveloperDashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl">
              Open Muster
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/bounties" className="text-sm font-medium hover:underline">
              Explore Bounties
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                Tier 2
              </Badge>
              <div className="h-8 w-8 rounded-full bg-primary"></div>
            </div>
          </nav>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <DashboardNav className="hidden md:block" />
        <main className="flex w-full flex-col overflow-hidden py-6">
          <div className="flex flex-col space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
              <p className="text-muted-foreground">Track your bounties and manage your submissions</p>
            </div>
            <DeveloperStats />
            <Tabs defaultValue="saved" className="w-full">
              <TabsList>
                <TabsTrigger value="saved">Saved Bounties</TabsTrigger>
                <TabsTrigger value="inprogress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="saved" className="space-y-4">
                <BountyList
                  bounties={[
                    {
                      id: "1",
                      title: "Implement Smart Contract for Token Staking",
                      description:
                        "Create a Solidity smart contract that allows users to stake ERC-20 tokens and earn rewards.",
                      prize: 500,
                      expiresIn: "5 days",
                      status: "active",
                      saved: true,
                    },
                    {
                      id: "5",
                      title: "Build Discord Bot Integration",
                      description: "Create a Discord bot that posts daily questions and interacts with users.",
                      prize: 350,
                      expiresIn: "3 days",
                      status: "active",
                      saved: true,
                    },
                  ]}
                  actionLabel="Start Building"
                />
              </TabsContent>
              <TabsContent value="inprogress" className="space-y-4">
                <BountyList
                  bounties={[
                    {
                      id: "2",
                      title: "Build React Component for Wallet Connection",
                      description:
                        "Create a reusable React component that handles wallet connection with Metamask and other providers.",
                      prize: 300,
                      expiresIn: "2 days",
                      status: "in-progress",
                    },
                  ]}
                  actionLabel="Submit Solution"
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
                      completedDate: "2 days ago",
                      status: "completed",
                    },
                  ]}
                  actionLabel="View Details"
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

