"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PieChart, Pie, Cell } from "recharts"
import { Badge } from "@/components/ui/badge"

// Dummy data
const globalData = {
  messagesPerHour: [
    { hour: 8, count: 10 },
    { hour: 9, count: 20 },
    { hour: 10, count: 35 },
    { hour: 11, count: 25 },
    { hour: 12, count: 15 },
  ],
  topThemes: [
    { theme: "DeFi", count: 50 },
    { theme: "NFTs", count: 30 },
    { theme: "Layer 2", count: 20 },
  ],
  sentiment: [
    { name: "Positive", value: 60 },
    { name: "Neutral", value: 30 },
    { name: "Negative", value: 10 },
  ],
  reactions: [
    { name: "👍", value: 45 },
    { name: "❤️", value: 30 },
    { name: "😂", value: 25 },
  ],
}

const botData = {
  mlmax: {
    messagesPerHour: [
      { hour: 8, count: 5 },
      { hour: 9, count: 8 },
      { hour: 10, count: 15 },
      { hour: 11, count: 12 },
      { hour: 12, count: 10 },
    ],
    topThemes: [
      { theme: "Memes", count: 40 },
      { theme: "Trading", count: 35 },
      { theme: "Airdrops", count: 25 },
    ],
    sentiment: [
      { name: "Positive", value: 70 },
      { name: "Neutral", value: 20 },
      { name: "Negative", value: 10 },
    ],
    reactions: [
      { name: "😂", value: 50 },
      { name: "🚀", value: 30 },
      { name: "💯", value: 20 },
    ],
    triggerEffectiveness: 75,
  },
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function AnalyticsPage() {
  const searchParams = useSearchParams()
  const [selectedBot, setSelectedBot] = useState<string | null>(null)

  useEffect(() => {
    const botParam = searchParams.get("bot")
    if (botParam && botData[botParam]) {
      setSelectedBot(botParam)
    } else {
      setSelectedBot(null)
    }
  }, [searchParams])

  const data = selectedBot && botData[selectedBot] ? botData[selectedBot] : globalData

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      <Select
        value={selectedBot || "global"}
        onValueChange={(value) => setSelectedBot(value === "global" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select analytics view" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="global">Global Analytics</SelectItem>
          {Object.keys(botData).map((botId) => (
            <SelectItem key={botId} value={botId}>
              {botId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages Per Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.messagesPerHour || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(data.topThemes || []).map((theme, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Badge variant="secondary">{theme.theme}</Badge>
                  <span>{theme.count} mentions</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sentiment || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(data.sentiment || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Reactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.reactions || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(data.reactions || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {selectedBot && (
          <Card>
            <CardHeader>
              <CardTitle>Trigger Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-4xl font-bold">{data.triggerEffectiveness || 0}%</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

