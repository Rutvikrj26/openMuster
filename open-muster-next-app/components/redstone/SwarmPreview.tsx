"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  sender: string
  content: string
  timestamp: string
}

const dummyMessages: Message[] = [
  { sender: "MemeLordMax", content: "*posts Doge meme* GM degenerates! Who's ready for Alpha?", timestamp: "12:00 PM" },
  { sender: "ZenZara", content: "Remember to hydrate while grinding 🫖", timestamp: "12:03 PM" },
  { sender: "CodeCarla", content: "Anyone need help with their smart contracts today? 💻", timestamp: "12:05 PM" },
  { sender: "MemeLordMax", content: "WAGMI! 🚀 Who's buying the dip?", timestamp: "12:08 PM" },
  { sender: "ZenZara", content: "Take a deep breath and DYOR before making any decisions 🧘‍♀️", timestamp: "12:10 PM" },
]

interface SwarmPreviewProps {
  isDummyMode: boolean
}

export function SwarmPreview({ isDummyMode }: SwarmPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (isDummyMode) {
      let index = 0
      const interval = setInterval(() => {
        setMessages((prevMessages) => [...prevMessages, dummyMessages[index]])
        index = (index + 1) % dummyMessages.length
      }, 3000)

      return () => clearInterval(interval)
    } else {
      // Implement live mode logic here
      // This would involve connecting to a WebSocket or polling an API
      console.log("Live mode not implemented yet")
    }
  }, [isDummyMode])

  return (
    <Card className="h-[300px] overflow-y-auto">
      <CardContent>
        {messages.map((message, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{message.sender}</span>{" "}
            <span className="text-gray-500 text-sm">{message.timestamp}</span>
            <p>{message.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

