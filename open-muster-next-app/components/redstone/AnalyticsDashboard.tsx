"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const dummyData = [
  { time: "8 AM", messages: 10 },
  { time: "9 AM", messages: 20 },
  { time: "10 AM", messages: 35 },
  { time: "11 AM", messages: 25 },
  { time: "12 PM", messages: 15 },
]

const dummyTriggers = [
  { trigger: "Meme", percentage: 45 },
  { trigger: "Stress", percentage: 30 },
  { trigger: "Crypto", percentage: 25 },
]

const dummySentiment = [
  { sentiment: "Positive", percentage: 70, emoji: "😊" },
  { sentiment: "Neutral", percentage: 20, emoji: "😐" },
  { sentiment: "Negative", percentage: 10, emoji: "😩" },
]

export function AnalyticsDashboard() {
  const [isLiveData, setIsLiveData] = useState(false)

  useEffect(() => {
    // Simulate transition to live data after 10 seconds
    const timer = setTimeout(() => {
      setIsLiveData(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages Per Hour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Triggers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {dummyTriggers.map((trigger, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                  <span>{trigger.trigger}</span>
                  <span>{trigger.percentage}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {dummySentiment.map((item, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                  <span>
                    {item.emoji} {item.sentiment}
                  </span>
                  <span>{item.percentage}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {isLiveData && <div className="text-center text-green-500">Live data is now being displayed</div>}
    </div>
  )
}

