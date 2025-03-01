"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { PersonaLibrary } from "./PersonaLibrary"
import { SwarmPreview } from "./SwarmPreview"

interface SwarmOrchestrationProps {
  onDeploy: () => void
}

export function SwarmOrchestration({ onDeploy }: SwarmOrchestrationProps) {
  const [activityStart, setActivityStart] = useState("08:00")
  const [activityEnd, setActivityEnd] = useState("22:00")
  const [responseFrequency, setResponseFrequency] = useState(5)
  const [isDummyMode, setIsDummyMode] = useState(true)

  const handleDeploy = async () => {
    // Implement swarm deployment logic here
    // For now, we'll just call the onDeploy callback
    onDeploy()
  }

  return (
    <div className="space-y-8">
      <PersonaLibrary />

      <div>
        <h3 className="text-xl font-semibold mb-4">Swarm Preview</h3>
        <div className="flex items-center justify-between mb-4">
          <span>Mode:</span>
          <Switch checked={isDummyMode} onCheckedChange={setIsDummyMode} label={isDummyMode ? "Dummy" : "Live"} />
        </div>
        <SwarmPreview isDummyMode={isDummyMode} />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Swarm Schedule</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="activityStart">Activity Start Time</Label>
            <Input
              type="time"
              id="activityStart"
              value={activityStart}
              onChange={(e) => setActivityStart(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="activityEnd">Activity End Time</Label>
            <Input type="time" id="activityEnd" value={activityEnd} onChange={(e) => setActivityEnd(e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="responseFrequency">Response Frequency (messages/hour)</Label>
          <Slider
            id="responseFrequency"
            min={1}
            max={10}
            step={1}
            value={[responseFrequency]}
            onValueChange={(value) => setResponseFrequency(value[0])}
          />
          <span className="text-sm text-gray-500">{responseFrequency} messages/hour</span>
        </div>
      </div>

      <Button onClick={handleDeploy}>Deploy Swarm</Button>
    </div>
  )
}

