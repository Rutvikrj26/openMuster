"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { debounce } from "@/lib/utils"

interface Bounty {
  id: string
  title: string
  description: string
  prize: number
  submissions?: number
  expiresIn?: string
  completedDate?: string
  status: "active" | "pending" | "in-progress" | "completed"
  saved?: boolean
}

interface BountyListProps {
  bounties: Bounty[]
  actionLabel?: string
}

export function BountyList({ bounties, actionLabel = "View Details" }: BountyListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        // Handle resize if needed
        console.log("BountyList resized")
      }, 100),
    )

    if (listRef.current) {
      resizeObserver.observe(listRef.current)
    }

    return () => {
      if (listRef.current) {
        resizeObserver.unobserve(listRef.current)
      }
    }
  }, [])

  return (
    <div ref={listRef} className="grid gap-4">
      {bounties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No bounties found</p>
          </CardContent>
        </Card>
      ) : (
        bounties.map((bounty) => (
          <Card key={bounty.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{bounty.title}</CardTitle>
                  <CardDescription className="mt-1">{bounty.description}</CardDescription>
                </div>
                {bounty.saved !== undefined && (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {bounty.saved ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                    <span className="sr-only">{bounty.saved ? "Unsave" : "Save"}</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-primary/10">
                  ${bounty.prize} USDC
                </Badge>
                {bounty.expiresIn && <Badge variant="outline">Expires in {bounty.expiresIn}</Badge>}
                {bounty.completedDate && <Badge variant="outline">Completed {bounty.completedDate}</Badge>}
                {bounty.submissions !== undefined && (
                  <Badge variant="outline">
                    {bounty.submissions} {bounty.submissions === 1 ? "submission" : "submissions"}
                  </Badge>
                )}
                <Badge
                  variant={
                    bounty.status === "active"
                      ? "default"
                      : bounty.status === "pending"
                        ? "secondary"
                        : bounty.status === "in-progress"
                          ? "secondary"
                          : "success"
                  }
                >
                  {bounty.status === "active"
                    ? "Active"
                    : bounty.status === "pending"
                      ? "Pending Review"
                      : bounty.status === "in-progress"
                        ? "In Progress"
                        : "Completed"}
                </Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/bounties/${bounty.id}`}>{actionLabel}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}

