"use client"

import type React from "react"

import type { Metadata } from "next"
import "./globals.css"
import { useEffect, useRef } from "react"
import { Inter } from "next/font/google"
import { debounce } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const layoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        // Handle resize if needed
        console.log("Layout resized")
      }, 100),
    )

    if (layoutRef.current) {
      resizeObserver.observe(layoutRef.current)
    }

    return () => {
      if (layoutRef.current) {
        resizeObserver.unobserve(layoutRef.current)
      }
    }
  }, [])

  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <div ref={layoutRef}>{children}</div>
      </body>
    </html>
  )
}



import './globals.css'