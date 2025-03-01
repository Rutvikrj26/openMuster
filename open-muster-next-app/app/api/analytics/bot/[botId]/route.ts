import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { botId: string } }) {
  const { botId } = params

  // TODO: Implement actual bot-specific analytics data fetching
  const dummyData = {
    messagesPerHour: [
      { hour: 8, count: 5 },
      { hour: 9, count: 8 },
      { hour: 10, count: 15 },
      { hour: 11, count: 12 },
      { hour: 12, count: 10 },
    ],
    triggerEffectiveness: 75,
    reactions: [
      { name: "😂", value: 30 },
      { name: "❤️", value: 20 },
      { name: "👍", value: 15 },
    ],
  }

  return NextResponse.json(dummyData)
}

