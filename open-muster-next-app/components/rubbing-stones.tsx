"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare } from "lucide-react"

interface Persona {
  name: string
  traits: {
    humor: number
    sarcasm: number
    empathy: number
  }
  knowledgeBase: string
  schedule: {
    activeHours: string
    responseFrequency: number
  }
}

export function RubbingStones() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [currentPersona, setCurrentPersona] = useState<Persona>({
    name: "",
    traits: { humor: 50, sarcasm: 50, empathy: 50 },
    knowledgeBase: "",
    schedule: { activeHours: "", responseFrequency: 5 },
  })

  const handleCreatePersona = () => {
    setPersonas([...personas, currentPersona])
    setCurrentPersona({
      name: "",
      traits: { humor: 50, sarcasm: 50, empathy: 50 },
      knowledgeBase: "",
      schedule: { activeHours: "", responseFrequency: 5 },
    })
  }

  const handleTraitChange = (trait: keyof Persona["traits"], value: number) => {
    setCurrentPersona({
      ...currentPersona,
      traits: { ...currentPersona.traits, [trait]: value },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-card text-neon-green border-neon-green hover:bg-neon-green hover:text-black"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Rubbing Stones
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Rubbing Stones: Swarm AI Chat Agents</DialogTitle>
          <DialogDescription>Create and manage AI chatbots for your Discord channels.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="persona">
          <TabsList>
            <TabsTrigger value="persona">Persona Configuration</TabsTrigger>
            <TabsTrigger value="swarm">Swarm Orchestration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="persona">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="personaName" className="text-right">
                  Persona Name
                </Label>
                <Input
                  id="personaName"
                  value={currentPersona.name}
                  onChange={(e) => setCurrentPersona({ ...currentPersona, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Traits</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center">
                    <span className="w-20">Humor:</span>
                    <Slider
                      value={[currentPersona.traits.humor]}
                      onValueChange={(value) => handleTraitChange("humor", value[0])}
                      max={100}
                      step={1}
                    />
                    <span className="ml-2">{currentPersona.traits.humor}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20">Sarcasm:</span>
                    <Slider
                      value={[currentPersona.traits.sarcasm]}
                      onValueChange={(value) => handleTraitChange("sarcasm", value[0])}
                      max={100}
                      step={1}
                    />
                    <span className="ml-2">{currentPersona.traits.sarcasm}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20">Empathy:</span>
                    <Slider
                      value={[currentPersona.traits.empathy]}
                      onValueChange={(value) => handleTraitChange("empathy", value[0])}
                      max={100}
                      step={1}
                    />
                    <span className="ml-2">{currentPersona.traits.empathy}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="knowledgeBase" className="text-right">
                  Knowledge Base
                </Label>
                <Textarea
                  id="knowledgeBase"
                  value={currentPersona.knowledgeBase}
                  onChange={(e) => setCurrentPersona({ ...currentPersona, knowledgeBase: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter FAQs, docs, or knowledge base information..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activeHours" className="text-right">
                  Active Hours
                </Label>
                <Input
                  id="activeHours"
                  value={currentPersona.schedule.activeHours}
                  onChange={(e) =>
                    setCurrentPersona({
                      ...currentPersona,
                      schedule: { ...currentPersona.schedule, activeHours: e.target.value },
                    })
                  }
                  className="col-span-3"
                  placeholder="e.g., 9AM-5PM EST"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="responseFrequency" className="text-right">
                  Response Frequency (minutes)
                </Label>
                <Input
                  id="responseFrequency"
                  type="number"
                  value={currentPersona.schedule.responseFrequency}
                  onChange={(e) =>
                    setCurrentPersona({
                      ...currentPersona,
                      schedule: { ...currentPersona.schedule, responseFrequency: Number.parseInt(e.target.value) },
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePersona}>Create Persona</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="swarm">
            <div className="py-4">
              <h3 className="text-lg font-medium mb-2">Swarm Orchestration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assign bots to channels and manage their interactions here.
              </p>
              {/* Add swarm orchestration UI components here */}
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="py-4">
              <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">View engagement metrics and bot performance.</p>
              {/* Add analytics dashboard components here */}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

