"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Persona {
  name: string
  personality: {
    humor: number
    sarcasm: number
    expertise: number
  }
  triggers: string[]
}

const defaultPersonas: Persona[] = [
  {
    name: "MemeLordMax",
    personality: { humor: 9, sarcasm: 7, expertise: 6 },
    triggers: ["gm", "alpha", "wen"],
  },
  {
    name: "ZenZara",
    personality: { humor: 5, sarcasm: 2, expertise: 8 },
    triggers: ["stress", "mindfulness", "balance"],
  },
]

export function PersonaLibrary() {
  const [personas, setPersonas] = useState<Persona[]>(defaultPersonas)
  const [newPersona, setNewPersona] = useState<Persona>({
    name: "",
    personality: { humor: 5, sarcasm: 5, expertise: 5 },
    triggers: [],
  })

  const handleAddPersona = () => {
    if (newPersona.name && newPersona.triggers.length > 0) {
      setPersonas([...personas, newPersona])
      setNewPersona({
        name: "",
        personality: { humor: 5, sarcasm: 5, expertise: 5 },
        triggers: [],
      })
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Persona Library</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {personas.map((persona) => (
          <Card key={persona.name}>
            <CardHeader>
              <CardTitle>{persona.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Label>Humor: {persona.personality.humor}</Label>
                  <Slider value={[persona.personality.humor]} max={10} step={1} disabled />
                </div>
                <div>
                  <Label>Sarcasm: {persona.personality.sarcasm}</Label>
                  <Slider value={[persona.personality.sarcasm]} max={10} step={1} disabled />
                </div>
                <div>
                  <Label>Expertise: {persona.personality.expertise}</Label>
                  <Slider value={[persona.personality.expertise]} max={10} step={1} disabled />
                </div>
                <div>
                  <Label>Triggers:</Label>
                  <p className="text-sm">{persona.triggers.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h4 className="text-lg font-semibold mb-2">Add Custom Persona</h4>
      <div className="space-y-4">
        <div>
          <Label htmlFor="personaName">Name</Label>
          <Input
            id="personaName"
            value={newPersona.name}
            onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
          />
        </div>
        <div>
          <Label>Personality</Label>
          <div className="space-y-2">
            <div>
              <Label>Humor: {newPersona.personality.humor}</Label>
              <Slider
                value={[newPersona.personality.humor]}
                max={10}
                step={1}
                onValueChange={(value) =>
                  setNewPersona({
                    ...newPersona,
                    personality: { ...newPersona.personality, humor: value[0] },
                  })
                }
              />
            </div>
            <div>
              <Label>Sarcasm: {newPersona.personality.sarcasm}</Label>
              <Slider
                value={[newPersona.personality.sarcasm]}
                max={10}
                step={1}
                onValueChange={(value) =>
                  setNewPersona({
                    ...newPersona,
                    personality: { ...newPersona.personality, sarcasm: value[0] },
                  })
                }
              />
            </div>
            <div>
              <Label>Expertise: {newPersona.personality.expertise}</Label>
              <Slider
                value={[newPersona.personality.expertise]}
                max={10}
                step={1}
                onValueChange={(value) =>
                  setNewPersona({
                    ...newPersona,
                    personality: { ...newPersona.personality, expertise: value[0] },
                  })
                }
              />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="personaTriggers">Triggers (comma-separated)</Label>
          <Input
            id="personaTriggers"
            value={newPersona.triggers.join(", ")}
            onChange={(e) =>
              setNewPersona({
                ...newPersona,
                triggers: e.target.value.split(",").map((trigger) => trigger.trim()),
              })
            }
          />
        </div>
        <Button onClick={handleAddPersona}>Add Persona</Button>
      </div>
    </div>
  )
}

