"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Zap, BarChart3 } from "lucide-react"
import { BotCard } from "@/components/rubbing-stones/BotCard"

// Dummy bot data
const dummyBots = [
  {
    id: "mlmax",
    name: "MemeLordMax",
    status: "active" as const,
    triggers: ["gm", "wen", "alpha"],
  },
]

export default function RubbingStonesLanding() {
  const [bots, setBots] = useState(dummyBots)

  const handleDeleteBot = (botId: string) => {
    setBots(bots.filter((bot) => bot.id !== botId))
  }

  const handleToggleBot = (botId: string, isActive: boolean) => {
    setBots(bots.map((bot) => (bot.id === botId ? { ...bot, status: isActive ? "active" : "inactive" } : bot)))
  }

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Revive Your Community with AI-Powered Engagement</h1>
        <p className="text-xl text-muted-foreground">
          Deploy persona-driven bots to simulate organic Discord activity.
        </p>
        <Button size="lg" asChild>
          <Link href="/rubbing-stones-swarm/provisioning">Get Started</Link>
        </Button>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-6 w-6" />
              Bot Provisioning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Connect your Discord in 2 clicks.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-6 w-6" />
              Swarm Orchestration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Design drama, debates, and camaraderie.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-6 w-6" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Track engagement in real time.</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Active Bots</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {bots.length > 0 ? (
            bots.map((bot) => (
              <BotCard
                key={bot.id}
                {...bot}
                onDelete={() => handleDeleteBot(bot.id)}
                onToggle={(isActive) => handleToggleBot(bot.id, isActive)}
              />
            ))
          ) : (
            <Card className="col-span-3 py-8">
              <CardContent className="text-center text-muted-foreground">
                No active bots. Start by provisioning bots!
              </CardContent>
            </Card>
          )}
          <Card className="flex items-center justify-center">
            <Button variant="outline" asChild>
              <Link href="/rubbing-stones-swarm/provisioning">
                <Bot className="mr-2 h-4 w-4" />
                Add New Bot
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  )
}

