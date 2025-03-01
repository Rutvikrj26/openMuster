import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export const WalletConnectButton: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      // Simulate wallet connection
      const mockAddress =
        "0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      setAddress(mockAddress)
      toast({
        title: "Wallet Connected",
        description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "⚠️ Wallet connection failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    setAddress(null)
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    })
  }

  return (
    <Button
      onClick={address ? handleDisconnect : handleConnect}
      variant="outline"
      size="sm"
      className="w-full max-w-[150px] truncate"
    >
      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
    </Button>
  )
}

