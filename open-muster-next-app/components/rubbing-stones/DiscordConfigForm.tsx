"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface DiscordConfigFormProps {
  onConnected: () => void
}

interface FormData {
  serverId: string
  channels: string
  botToken: string
  permissions: {
    readMessages: boolean
    sendMessages: boolean
    manageThreads: boolean
  }
}

export function DiscordConfigForm({ onConnected }: DiscordConfigFormProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/discord/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setTestStatus("success")
        onConnected()
      } else {
        setTestStatus("error")
      }
    } catch (error) {
      console.error("Error connecting to Discord:", error)
      setTestStatus("error")
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="serverId">Discord Server ID</Label>
            <Input
              id="serverId"
              {...register("serverId", { required: "Server ID is required" })}
              placeholder="Enter your Discord Server ID"
            />
            {errors.serverId && <p className="text-red-500 text-sm mt-1">{errors.serverId.message}</p>}
            <a
              href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              How to find your Server ID
            </a>
          </div>

          <div>
            <Label htmlFor="channels">Channel Links</Label>
            <Input
              id="channels"
              {...register("channels", { required: "At least one channel link is required" })}
              placeholder="https://discord.com/channels/..."
            />
            {errors.channels && <p className="text-red-500 text-sm mt-1">{errors.channels.message}</p>}
          </div>

          <div>
            <Label htmlFor="botToken">Bot Token</Label>
            <Input
              id="botToken"
              type="password"
              {...register("botToken", { required: "Bot token is required" })}
              placeholder="Enter your bot token"
            />
            {errors.botToken && <p className="text-red-500 text-sm mt-1">{errors.botToken.message}</p>}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => window.open("https://discord.com/developers/applications", "_blank")}
            >
              Generate Token
            </Button>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox id="readMessages" {...register("permissions.readMessages")} />
                <Label htmlFor="readMessages" className="ml-2">
                  Read Messages
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="sendMessages" {...register("permissions.sendMessages")} />
                <Label htmlFor="sendMessages" className="ml-2">
                  Send Messages
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="manageThreads" {...register("permissions.manageThreads")} />
                <Label htmlFor="manageThreads" className="ml-2">
                  Manage Threads
                </Label>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Test Connection
          </Button>
        </CardFooter>
      </form>

      {testStatus === "success" && (
        <div className="flex items-center text-green-500 mt-4">
          <CheckCircle2 className="mr-2" />
          <span>✅ Connected to #general, #dev!</span>
        </div>
      )}

      {testStatus === "error" && (
        <div className="flex items-center text-red-500 mt-4">
          <AlertCircle className="mr-2" />
          <span>
            ⚠️ Invalid token or permissions.{" "}
            <Button variant="link" className="p-0 h-auto font-normal">
              Fix Now
            </Button>
          </span>
        </div>
      )}
    </Card>
  )
}

