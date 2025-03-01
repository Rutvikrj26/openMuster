"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2 } from "lucide-react"

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
    reactToMessages: boolean
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
      const response = await fetch("/api/discord/connect", {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="serverId">Discord Server ID</Label>
        <Input
          id="serverId"
          {...register("serverId", { required: "Server ID is required" })}
          placeholder="Enter your Discord Server ID"
        />
        {errors.serverId && <p className="text-red-500 text-sm mt-1">{errors.serverId.message}</p>}
        <a href="#" className="text-sm text-blue-500 hover:underline">
          How to find this
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
        <Button type="button" variant="outline" className="mt-2">
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
          <div className="flex items-center">
            <Checkbox id="reactToMessages" {...register("permissions.reactToMessages")} />
            <Label htmlFor="reactToMessages" className="ml-2">
              React to Messages
            </Label>
          </div>
        </div>
      </div>

      <Button type="submit">Test Connection</Button>

      {testStatus === "success" && (
        <div className="flex items-center text-green-500">
          <CheckCircle2 className="mr-2" />
          <span>Connected to #general, #memes!</span>
        </div>
      )}

      {testStatus === "error" && (
        <div className="flex items-center text-red-500">
          <AlertCircle className="mr-2" />
          <span>
            Token invalid.{" "}
            <Button variant="link" className="p-0">
              Regenerate
            </Button>
          </span>
        </div>
      )}
    </form>
  )
}

