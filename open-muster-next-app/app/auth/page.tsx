"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GithubIcon } from "lucide-react"
import { MetamaskIcon } from "@/components/icons/metamask-icon"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const defaultType = searchParams.get("type") || "developer"
  const [isConnectingGithub, setIsConnectingGithub] = useState(false)
  const [isConnectingMetamask, setIsConnectingMetamask] = useState(false)

  const handleGithubConnect = async () => {
    setIsConnectingGithub(true)
    // Implement GitHub OAuth flow
    // This would typically involve redirecting to GitHub's OAuth page
    console.log("Connecting to GitHub")
    // Simulate OAuth process
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsConnectingGithub(false)
    // Redirect to appropriate dashboard after successful authentication
    window.location.href = defaultType === "company" ? "/dashboard/company" : "/dashboard/developer"
  }

  const handleMetamaskConnect = async () => {
    setIsConnectingMetamask(true)
    // Implement Metamask connection
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected to Metamask")
      } catch (error) {
        console.error("Failed to connect to Metamask:", error)
      }
    } else {
      console.error("Metamask not detected")
    }
    setIsConnectingMetamask(false)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center justify-center text-sm font-medium"
      >
        ← Back
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Open Muster</h1>
          <p className="text-sm text-muted-foreground">Connect your accounts to get started</p>
        </div>
        <Tabs defaultValue={defaultType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="developer">Developer</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>
          <TabsContent value="developer">
            <Card>
              <CardHeader>
                <CardTitle>Developer Account</CardTitle>
                <CardDescription>Connect your GitHub account to find and work on bounties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleGithubConnect} disabled={isConnectingGithub}>
                  {isConnectingGithub ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <GithubIcon className="h-4 w-4" />
                      Connect with GitHub
                    </span>
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Optional</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleMetamaskConnect}
                  disabled={isConnectingMetamask}
                >
                  {isConnectingMetamask ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MetamaskIcon className="h-4 w-4" />
                      Connect Metamask
                    </span>
                  )}
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <p className="text-xs text-muted-foreground">
                  Metamask is required to claim rewards but can be connected later.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Account</CardTitle>
                <CardDescription>Connect your accounts to create and fund bounties</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleGithubConnect} disabled={isConnectingGithub}>
                  {isConnectingGithub ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <GithubIcon className="h-4 w-4" />
                      Connect with GitHub
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleMetamaskConnect}
                  disabled={isConnectingMetamask}
                >
                  {isConnectingMetamask ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Connecting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <MetamaskIcon className="h-4 w-4" />
                      Connect Metamask
                    </span>
                  )}
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <p className="text-xs text-muted-foreground">
                  Both GitHub and Metamask are required to create bounties.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

