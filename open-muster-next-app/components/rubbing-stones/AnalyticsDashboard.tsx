"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const dummyData = [
  { time: "8 AM", messages: 5 },
  { time: "9 AM", messages: 8 },
  { time: "10 AM", messages: 15 },
  { time: "11 AM", messages: 12 },
  { time: "12 PM", messages: 10 },
  { time: "1 PM", messages: 7 },
  { time: "2 PM", messages: 9 },
  { time: "3 PM", messages: 14 },
  { time: "4 PM", messages: 11 },
  { time: "5 PM", messages: 6 },
]

const dummyTriggers = [
  { trigger: "GM", percentage: 60 },
  { trigger: "Wen", percentage: 25 },
  { trigger: "Alpha", percentage: 15 },
]

const dummyReactions = [
  { reaction: "😂", percentage: 80 },
  { reaction: "🤔", percentage: 15 },
  { reaction: "😒", percentage: 5 },
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
            <CardTitle>User Reactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {dummyReactions.map((reaction, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                  <span>{reaction.reaction}</span>
                  <span>{reaction.percentage}%</span>
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

