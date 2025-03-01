"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface Message {
  sender: string
  content: string
  timestamp: string
}

interface Persona {
  name: string
  triggerWords: string[]
  responseStyle: "Friendly" | "Sarcastic" | "Analytical"
}

interface SwarmSimulatorProps {
  personas: Persona[]
}

export function SwarmSimulator({ personas }: SwarmSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const simulateChat = () => {
      const newMessage = generateMessage(personas)
      setMessages((prevMessages) => [...prevMessages, newMessage])
    }

    const interval = setInterval(simulateChat, 3000)

    return () => clearInterval(interval)
  }, [personas])

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

function generateMessage(personas: Persona[]): Message {
  const persona = personas[Math.floor(Math.random() * personas.length)]
  const content = generateContent(persona)
  const timestamp = new Date().toLocaleTimeString()

  return {
    sender: persona.name,
    content,
    timestamp,
  }
}

function generateContent(persona: Persona): string {
  const triggerWord = persona.triggerWords[Math.floor(Math.random() * persona.triggerWords.length)]

  switch (persona.responseStyle) {
    case "Friendly":
      return `Hey everyone! Just wanted to chat about ${triggerWord}. What are your thoughts?`
    case "Sarcastic":
      return `Oh great, another discussion about ${triggerWord}. I'm sure this will be thrilling.`
    case "Analytical":
      return `Let's examine the data regarding ${triggerWord}. Does anyone have any recent statistics?`
    default:
      return `${triggerWord} is an interesting topic. What do you all think?`
  }
}

