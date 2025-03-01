"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwarmSimulator } from "@/components/rubbing-stones/SwarmSimulator"

interface Persona {
  name: string
  triggerWords: string[]
  responseStyle: "Friendly" | "Sarcastic" | "Analytical"
}

const defaultPersonas: Persona[] = [
  { name: "MemeLordMax", triggerWords: ["gm", "wen", "alpha"], responseStyle: "Sarcastic" },
  { name: "ZenZara", triggerWords: ["stress", "mindfulness", "balance"], responseStyle: "Friendly" },
  { name: "FactCheckFiona", triggerWords: ["source", "actually", "data"], responseStyle: "Analytical" },
]

export default function SwarmOrchestration() {
  const [personas, setPersonas] = useState<Persona[]>(defaultPersonas)
  const [newPersona, setNewPersona] = useState<Persona>({
    name: "",
    triggerWords: [],
    responseStyle: "Friendly",
  })
  const [activeHours, setActiveHours] = useState({ start: "09:00", end: "17:00" })
  const [messageDelay, setMessageDelay] = useState(3)

  const handleAddPersona = () => {
    if (newPersona.name && newPersona.triggerWords.length > 0) {
      setPersonas([...personas, newPersona])
      setNewPersona({ name: "", triggerWords: [], responseStyle: "Friendly" })
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Design Your Bot Personalities</h1>

      <Card>
        <CardHeader>
          <CardTitle>Persona Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {personas.map((persona, index) => (
            <div key={index} className="p-4 border rounded">
              <h3 className="font-bold">{persona.name}</h3>
              <p>Trigger Words: {persona.triggerWords.join(", ")}</p>
              <p>Response Style: {persona.responseStyle}</p>
            </div>
          ))}

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-bold">Add Custom Bot</h3>
            <div className="space-y-2">
              <Label htmlFor="personaName">Name</Label>
              <Input
                id="personaName"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="triggerWords">Trigger Words</Label>
              <Input
                id="triggerWords"
                value={newPersona.triggerWords.join(", ")}
                onChange={(e) =>
                  setNewPersona({
                    ...newPersona,
                    triggerWords: e.target.value.split(",").map((word) => word.trim()),
                  })
                }
                placeholder="e.g., gm, wen, alpha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responseStyle">Response Style</Label>
              <Select
                value={newPersona.responseStyle}
                onValueChange={(value) =>
                  setNewPersona({ ...newPersona, responseStyle: value as "Friendly" | "Sarcastic" | "Analytical" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a response style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                  <SelectItem value="Analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddPersona}>Add Persona</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Active Hours</Label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="activeHoursStart">Start</Label>
                <Input
                  id="activeHoursStart"
                  type="time"
                  value={activeHours.start}
                  onChange={(e) => setActiveHours({ ...activeHours, start: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="activeHoursEnd">End</Label>
                <Input
                  id="activeHoursEnd"
                  type="time"
                  value={activeHours.end}
                  onChange={(e) => setActiveHours({ ...activeHours, end: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="messageDelay">Message Delay (1-5 minutes)</Label>
            <Slider
              id="messageDelay"
              min={1}
              max={5}
              step={1}
              value={[messageDelay]}
              onValueChange={(value) => setMessageDelay(value[0])}
            />
            <p className="text-sm text-muted-foreground">Current delay: {messageDelay} minutes</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dummy Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <SwarmSimulator personas={personas} />
        </CardContent>
      </Card>
    </div>
  )
}

