"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonaLibrary } from "./PersonaLibrary"
import { SwarmSimulator } from "./SwarmSimulator"

interface SwarmOrchestrationProps {
  onActivate: () => void
}

export function SwarmOrchestration({ onActivate }: SwarmOrchestrationProps) {
  const [activeHoursStart, setActiveHoursStart] = useState("09:00")
  const [activeHoursEnd, setActiveHoursEnd] = useState("17:00")
  const [messageFrequency, setMessageFrequency] = useState(5)
  const [isSimulationMode, setIsSimulationMode] = useState(true)

  const handleActivateSwarm = async () => {
    // Implement swarm activation logic here
    // For now, we'll just call the onActivate callback
    onActivate()
  }

  return (
    <div className="space-y-8">
      <PersonaLibrary />

      <Card>
        <CardHeader>
          <CardTitle>Swarm Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span>Mode:</span>
            <Switch
              checked={isSimulationMode}
              onCheckedChange={setIsSimulationMode}
              label={isSimulationMode ? "Simulation" : "Live"}
            />
          </div>
          <SwarmSimulator isSimulationMode={isSimulationMode} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Swarm Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activeHoursStart">Active Hours Start</Label>
              <Input
                type="time"
                id="activeHoursStart"
                value={activeHoursStart}
                onChange={(e) => setActiveHoursStart(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="activeHoursEnd">Active Hours End</Label>
              <Input
                type="time"
                id="activeHoursEnd"
                value={activeHoursEnd}
                onChange={(e) => setActiveHoursEnd(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="messageFrequency">Message Frequency (messages/hour)</Label>
            <Slider
              id="messageFrequency"
              min={1}
              max={15}
              step={1}
              value={[messageFrequency]}
              onValueChange={(value) => setMessageFrequency(value[0])}
            />
            <span className="text-sm text-gray-500">{messageFrequency} messages/hour</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleActivateSwarm} className="w-full">
            Activate Swarm
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

