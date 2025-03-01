"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MessageCircle, MoreVertical, BarChart2 } from "lucide-react"

interface BotCardProps {
  id: string
  name: string
  status: "active" | "inactive"
  triggers: string[]
  onDelete: () => void
  onToggle: (isActive: boolean) => void
}

export function BotCard({ id, name, status, triggers, onDelete, onToggle }: BotCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            {name} 🤖
          </span>
          <div className="flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-green-500" : "bg-red-500"}`} />
            <Switch checked={status === "active"} onCheckedChange={onToggle} aria-label="Toggle bot status" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/rubbing-stones-swarm/analytics?bot=${id}`}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>Delete Bot</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <strong>Triggers:</strong> {triggers.join(", ")}
        </p>
      </CardContent>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this bot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bot and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

