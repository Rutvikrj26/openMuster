"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function BotProvisioning() {
  const [serverId, setServerId] = useState("")
  const [channels, setChannels] = useState("")
  const [botToken, setBotToken] = useState("")
  const [permissions, setPermissions] = useState({
    readMessages: true,
    sendMessages: true,
    manageThreads: true,
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)

    try {
      const response = await fetch("/api/discord/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId, channels, botToken, permissions }),
      })

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Your Discord server has been connected.",
          duration: 5000,
        })
      } else {
        throw new Error("Failed to connect")
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Please check your inputs and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Connect Your Discord Server</h1>
      <Card>
        <form onSubmit={handleConnect}>
          <CardHeader>
            <CardTitle>Discord Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serverId">Discord Server ID</Label>
              <Input
                id="serverId"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
                placeholder="Enter your Discord Server ID"
                required
              />
              <a
                href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                How to find your Server ID
              </a>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channels">Channel Links</Label>
              <Input
                id="channels"
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
                placeholder="https://discord.com/channels/..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Enter your bot token"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open("https://discord.com/developers/applications", "_blank")}
              >
                Generate Token
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="readMessages"
                    checked={permissions.readMessages}
                    onCheckedChange={(checked) => setPermissions({ ...permissions, readMessages: checked as boolean })}
                  />
                  <Label htmlFor="readMessages">Read Messages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendMessages"
                    checked={permissions.sendMessages}
                    onCheckedChange={(checked) => setPermissions({ ...permissions, sendMessages: checked as boolean })}
                  />
                  <Label htmlFor="sendMessages">Send Messages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageThreads"
                    checked={permissions.manageThreads}
                    onCheckedChange={(checked) => setPermissions({ ...permissions, manageThreads: checked as boolean })}
                  />
                  <Label htmlFor="manageThreads">Manage Threads</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Discord"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

