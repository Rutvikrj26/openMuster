import { verifyKey } from "discord-interactions"
import type { NextRequest } from "next/server"

export async function verifyDiscordRequest(request: NextRequest, body: string) {
  const signature = request.headers.get("x-signature-ed25519")
  const timestamp = request.headers.get("x-signature-timestamp")

  if (!signature || !timestamp) {
    return false
  }

  const isValidRequest = verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!)

  return isValidRequest
}

export async function sendDiscordMessage(channelId: string, content: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send Discord message: ${response.statusText}`)
  }

  return await response.json()
}

