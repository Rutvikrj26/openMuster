interface KeywordTriggers {
  [key: string]: string[]
}

export class InteractionLogic {
  private keywordTriggers: KeywordTriggers = {
    ZenZara: ["stress", "anxious", "overwhelmed"],
    MemeLordMax: ["meme", "lol", "quiet"],
  }

  detectTriggers(message: string): string[] {
    const triggeredPersonas: string[] = []
    for (const [persona, triggers] of Object.entries(this.keywordTriggers)) {
      if (triggers.some((trigger) => message.toLowerCase().includes(trigger))) {
        triggeredPersonas.push(persona)
      }
    }
    return triggeredPersonas
  }

  limitThreadParticipation(personaName: string, threadId: string): boolean {
    // TODO: Implement logic to limit bot replies per thread
    return true // Placeholder
  }

  generateCrossBotDrama(persona1: string, persona2: string): string {
    // TODO: Implement cross-bot drama generation
    return `${persona1} and ${persona2} are having a friendly disagreement.`
  }
}

