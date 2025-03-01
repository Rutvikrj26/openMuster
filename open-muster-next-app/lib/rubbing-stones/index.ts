import { AgentCore } from "./agent-core"
import { SwarmScheduler } from "./swarm-scheduler"
import { InteractionLogic } from "./interaction-logic"
import type { Persona } from "./types"

export class RubbingStones {
  private agentCore: AgentCore
  private swarmScheduler: SwarmScheduler
  private interactionLogic: InteractionLogic

  constructor() {
    this.agentCore = new AgentCore()
    this.swarmScheduler = new SwarmScheduler()
    this.interactionLogic = new InteractionLogic()
  }

  addPersona(persona: Persona) {
    this.agentCore.addPersona(persona)
    this.swarmScheduler.addPersona(persona)
  }

  async handleMessage(channelId: string, message: string) {
    const triggeredPersonas = this.interactionLogic.detectTriggers(message)
    for (const personaName of triggeredPersonas) {
      const delay = this.swarmScheduler.getResponseDelay()
      await new Promise((resolve) => setTimeout(resolve, delay))
      const response = this.agentCore.generateResponse(personaName, message)
      this.sendResponse(channelId, response)
    }
  }

  private sendResponse(channelId: string, response: string) {
    // TODO: Implement Discord API integration to send the response
    console.log(`Sending response to channel ${channelId}: ${response}`)
  }

  scheduleActivities(channelId: string) {
    this.swarmScheduler.scheduleActivity(channelId)
  }
}

