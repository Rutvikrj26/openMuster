"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Github, Loader2, BookmarkCheck, Bookmark } from "lucide-react"
import { MetamaskIcon } from "@/components/icons/metamask-icon"

export default function BountyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")
  const [activeTab, setActiveTab] = useState("details")
  const [error, setError] = useState<string | null>(null)

  // Mock data for the bounty
  const bounty = {
    id,
    title: "Implement Smart Contract for Token Staking",
    description:
      "Create a Solidity smart contract that allows users to stake ERC-20 tokens and earn rewards based on time staked. The contract should include functions for staking, unstaking, and claiming rewards.",
    prize: 500,
    expiresIn: "5 days",
    status: "active",
    company: {
      name: "DeFi Protocol",
      verified: true,
    },
    requirements: [
      "Experience with Solidity and ERC-20 tokens",
      "Understanding of staking mechanisms",
      "Knowledge of secure smart contract development practices",
      "Ability to write comprehensive tests",
    ],
    additionalInfo: `
      ## Background
      
      Our protocol needs a staking mechanism to incentivize token holders to lock up their tokens for longer periods.
      
      ## Technical Details
      
      - The contract should be compatible with any ERC-20 token
      - Rewards should be calculated based on the amount staked and time period
      - Include a time-lock mechanism with early withdrawal penalties
      - Gas optimization is important
      
      ## Deliverables
      
      1. Solidity smart contract code
      2. Unit tests
      3. Documentation explaining the implementation
    `,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate submission
      const validationResponse = await fetch("/api/validate-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bountyId: id,
          repoUrl: repoUrl,
        }),
      })

      if (!validationResponse.ok) {
        throw new Error(`Validation failed: ${validationResponse.status} ${validationResponse.statusText}`)
      }

      let validationData
      const responseText = await validationResponse.text()
      try {
        validationData = JSON.parse(responseText)
      } catch (jsonError) {
        console.error("Error parsing validation response:", jsonError, "Response text:", responseText)
        throw new Error("Invalid response from validation server")
      }

      if (!validationData.success) {
        throw new Error(validationData.error || "Validation failed")
      }

      if (validationData.similarityScore < 80) {
        setError(
          `Your submission did not meet the minimum similarity threshold (${validationData.similarityScore}%). Please review the bounty requirements and try again.`,
        )
        return
      }

      // If validation passes, submit the bounty
      const submissionResponse = await fetch("/api/submit-bounty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bountyId: id,
          repoUrl: repoUrl,
        }),
      })

      if (!submissionResponse.ok) {
        throw new Error(`Submission failed: ${submissionResponse.status} ${submissionResponse.statusText}`)
      }

      const submissionData = await submissionResponse.json()

      if (!submissionData.success) {
        throw new Error(submissionData.error || "Submission failed")
      }

      // Redirect to success page
      router.push("/dashboard/developer?submission=success")
    } catch (error) {
      console.error("Submission error:", error)
      setError(error.message || "An unexpected error occurred during submission. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl">
              Open Muster
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/bounties" className="text-sm font-medium hover:underline">
              Explore Bounties
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="container max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bounties">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bounties
              </Link>
            </Button>
          </div>

          <div className="flex flex-col space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{bounty.title}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10">
                    ${bounty.prize} USDC
                  </Badge>
                  <Badge variant="outline">Expires in {bounty.expiresIn}</Badge>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={() => setIsSaved(!isSaved)}>
                {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Posted by {bounty.company.name}</CardTitle>
                    <CardDescription>{bounty.company.verified && "Verified company"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="submit">Submit Solution</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="mt-1 text-muted-foreground">{bounty.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Additional Information</h3>
                      <div className="mt-2 prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">{bounty.additionalInfo}</pre>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="requirements" className="mt-4">
                    <div>
                      <h3 className="font-medium mb-2">Requirements</h3>
                      <ul className="space-y-2">
                        {bounty.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="submit" className="mt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && <div className="text-red-500 mb-4">{error}</div>}
                      <div className="space-y-2">
                        <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                        <div className="flex items-center space-x-2">
                          <Github className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="repoUrl"
                            placeholder="https://github.com/yourusername/yourrepo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-600">
                        <MetamaskIcon className="h-5 w-5" />
                        <div className="text-sm">
                          Connect your Metamask wallet to receive payment if your submission is approved
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting || !repoUrl}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Solution"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                {activeTab !== "submit" && <Button onClick={() => setActiveTab("submit")}>Submit Solution</Button>}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

