"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Github } from "lucide-react"
import { MetamaskIcon } from "@/components/icons/metamask-icon"

export default function CreateBountyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [formData, setFormData] = useState({
    repoUrl: "",
    roadmap: "",
    basePrize: 100,
    dynamicPricing: false,
    selectedBounty: 0,
  })

  const [generatedBounties, setGeneratedBounties] = useState<
    | null
    | {
        title: string
        description: string
      }[]
  >(null)

  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "basePrize" ? Number(value) : value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      dynamicPricing: checked,
    })
  }

  const handleGenerateBounties = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch("/api/generate-bounties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: formData.repoUrl,
          roadmap: formData.roadmap,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!")
      }

      const data = await response.json()
      if (data.success) {
        setGeneratedBounties(data.bounties)
        setStep(2)
      } else {
        throw new Error(data.error || "Failed to generate bounties")
      }
    } catch (error) {
      console.error("Error generating bounties:", error)
      setError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectBounty = (index: number) => {
    setFormData({
      ...formData,
      selectedBounty: index,
    })
  }

  const handleStakeFunds = async () => {
    setIsStaking(true)
    try {
      // Implement staking logic here
      // This would typically involve interacting with a smart contract
      console.log("Staking funds...")
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push("/dashboard/company?success=true")
    } catch (error) {
      console.error("Error staking funds:", error)
      setError("Failed to stake funds. Please try again.")
    } finally {
      setIsStaking(false)
    }
  }

  const totalStake = formData.dynamicPricing ? formData.basePrize * 1.25 : formData.basePrize

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/company">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create a Bounty</h1>
          <p className="text-muted-foreground">Set up a new bounty for developers to work on</p>
        </div>

        {error && <div className="text-red-500 mb-4">Error: {error}</div>}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Bounty Details</CardTitle>
              <CardDescription>Provide information about your project and bounty requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="repoUrl"
                    name="repoUrl"
                    placeholder="https://github.com/yourusername/yourrepo"
                    value={formData.repoUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roadmap">Project Roadmap / Context</Label>
                <Textarea
                  id="roadmap"
                  name="roadmap"
                  placeholder="Describe your project goals and what you're trying to achieve..."
                  rows={4}
                  value={formData.roadmap}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrize">Base Bounty Prize (USDC)</Label>
                <Input
                  id="basePrize"
                  name="basePrize"
                  type="number"
                  min={100}
                  value={formData.basePrize}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-muted-foreground">Minimum $100 USDC</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="dynamicPricing" checked={formData.dynamicPricing} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="dynamicPricing">Enable Dynamic Pricing (+25% stake)</Label>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="flex justify-between font-medium">
                  <span>Total to stake:</span>
                  <span>${totalStake} USDC</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formData.dynamicPricing
                    ? "125% of base prize will be staked to enable dynamic pricing"
                    : "100% of base prize will be staked"}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateBounties}
                disabled={isGenerating || !formData.repoUrl || !formData.roadmap || formData.basePrize < 100}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Bounties...
                  </>
                ) : (
                  "Generate Bounty Suggestions"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && generatedBounties && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Bounty</CardTitle>
              <CardDescription>
                Our AI has analyzed your repository and generated these bounty suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedBounties.map((bounty, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    formData.selectedBounty === index ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleSelectBounty(index)}
                >
                  <h3 className="font-medium">{bounty.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{bounty.description}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={formData.selectedBounty === undefined}>
                Continue to Payment
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && generatedBounties && (
          <Card>
            <CardHeader>
              <CardTitle>Stake Funds</CardTitle>
              <CardDescription>Stake USDC to create your bounty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">{generatedBounties[formData.selectedBounty].title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {generatedBounties[formData.selectedBounty].description}
                </p>
              </div>
              <div className="rounded-md bg-muted p-4">
                <div className="flex justify-between font-medium">
                  <span>Base Prize:</span>
                  <span>${formData.basePrize} USDC</span>
                </div>
                {formData.dynamicPricing && (
                  <div className="flex justify-between font-medium mt-2">
                    <span>Dynamic Pricing Stake (25%):</span>
                    <span>${formData.basePrize * 0.25} USDC</span>
                  </div>
                )}
                <div className="mt-2 border-t pt-2 flex justify-between font-bold">
                  <span>Total to Stake:</span>
                  <span>${totalStake} USDC</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-600">
                <MetamaskIcon className="h-5 w-5" />
                <div className="text-sm">You'll need to approve this transaction in your Metamask wallet</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleStakeFunds} disabled={isStaking}>
                {isStaking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Staking Funds...
                  </>
                ) : (
                  "Stake Funds & Create Bounty"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

