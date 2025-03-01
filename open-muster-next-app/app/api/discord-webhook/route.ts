import { NextResponse } from "next/server"
import { RubbingStones } from "@/lib/rubbing-stones"

const rubbingStones = new RubbingStones()

export async function POST(req: Request) {
  const body = await req.json()

  if (body.type === 1) {
    return NextResponse.json({ type: 1 })
  }

  if (body.type === 2 && body.data.type === 0) {
    const { channel_id, content } = body.data
    await rubbingStones.handleMessage(channel_id, content)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Unhandled event type" }, { status: 400 })
}

