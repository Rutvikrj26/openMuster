"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"

export function Web3Integration() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setIsConnected(true)
          setAddress(accounts[0].address)
          checkAccess(accounts[0].address)
        }
      } catch (error) {
        console.error("Failed to connect to wallet:", error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setIsConnected(true)
        setAddress(address)
        checkAccess(address)
      } catch (error) {
        console.error("Failed to connect to wallet:", error)
      }
    } else {
      console.log("Please install MetaMask")
    }
  }

  const checkAccess = async (address: string) => {
    // This is a placeholder for checking if the user has the RUBBING_STONES_ACCESS NFT
    // In a real implementation, you would query the blockchain or your backend
    const hasToken = Math.random() < 0.5 // 50% chance of having access for demo purposes
    setHasAccess(hasToken)
  }

  return (
    <div className="mb-8">
      {!isConnected ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <div>
          <p>
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {hasAccess ? (
            <p className="text-green-500">You have access to Rubbing Stones Swarm</p>
          ) : (
            <p className="text-red-500">You do not have the required RUBBING_STONES_ACCESS token</p>
          )}
        </div>
      )}
    </div>
  )
}

