"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GithubIcon } from "lucide-react"

interface GithubData {
  commits: number
  stars: number
  followers: number
  languages: string[]
}

export function DeveloperProfile() {
  const [githubData, setGithubData] = useState<GithubData | null>(null)
  const [skillScore, setSkillScore] = useState(0)
  const [skillTier, setSkillTier] = useState(0)

  useEffect(() => {
    // Simulating GitHub OAuth data fetch
    const fetchGithubData = async () => {
      // In a real app, this would be an API call to GitHub
      const mockData: GithubData = {
        commits: 150,
        stars: 75,
        followers: 30,
        languages: ["JavaScript", "TypeScript", "Solidity"],
      }
      setGithubData(mockData)

      // Calculate skill score
      const score = mockData.commits * 0.5 + mockData.stars * 0.3 + mockData.followers * 0.2
      setSkillScore(Math.round(score))

      // Determine skill tier
      if (score <= 50) setSkillTier(1)
      else if (score <= 100) setSkillTier(2)
      else setSkillTier(3)
    }

    fetchGithubData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer Profile</CardTitle>
        <CardDescription>Your GitHub stats and skill score</CardDescription>
      </CardHeader>
      <CardContent>
        {githubData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Skill Score:</span>
              <Badge variant="secondary">{skillScore}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Skill Tier:</span>
              <Badge>{skillTier}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Commits (last 90 days):</span>
                <span>{githubData.commits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stars:</span>
                <span>{githubData.stars}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Followers:</span>
                <span>{githubData.followers}</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Languages:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {githubData.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>Connect your GitHub account to view your profile</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={!!githubData}>
          <GithubIcon className="mr-2 h-4 w-4" />
          {githubData ? "GitHub Connected" : "Connect GitHub"}
        </Button>
      </CardFooter>
    </Card>
  )
}

