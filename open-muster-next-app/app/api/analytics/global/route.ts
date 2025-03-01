import { NextResponse } from "next/server"

export async function GET() {
  // TODO: Implement actual global analytics data fetching
  const dummyData = {
    messagesPerHour: [
      { hour: 8, count: 10 },
      { hour: 9, count: 20 },
      { hour: 10, count: 35 },
      { hour: 11, count: 25 },
      { hour: 12, count: 15 },
    ],
    topTriggers: [
      { keyword: "GM", count: 45 },
      { keyword: "Wen", count: 30 },
      { keyword: "Alpha", count: 25 },
    ],
    sentiment: [
      { name: "😊", value: 70 },
      { name: "😐", value: 20 },
      { name: "😩", value: 10 },
    ],
  }

  return NextResponse.json(dummyData)
}

