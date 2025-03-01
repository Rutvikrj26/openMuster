"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type AuthContextType = {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if the user is already authenticated (e.g., by checking a token in localStorage)
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Implement your actual login logic here
    // For now, we'll just simulate a successful login
    await new Promise((resolve) => setTimeout(resolve, 1000))
    localStorage.setItem("authToken", "dummy-token")
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

