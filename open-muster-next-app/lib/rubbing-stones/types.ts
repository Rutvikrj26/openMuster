export interface Persona {
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

