"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "./Sidebar"
import type React from "react" // Added import for React

type AuthWrapperProps = {
  children: React.ReactNode
}

const adminRoutes = ["/reservations", "/books", "/users", "/reviews", "/stats", "/settings"]
const userRoutes = ["/", "/history"]

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUserRole = localStorage.getItem("userRole")
    setUserRole(storedUserRole)

    if (!storedUserRole && pathname !== "/login" && pathname !== "/register") {
      router.push("/login")
    } else if (storedUserRole) {
      setIsAuthenticated(true)

      if (storedUserRole === "admin" && !adminRoutes.includes(pathname)) {
        router.push("/reservations")
      } else if (storedUserRole === "user" && !userRoutes.includes(pathname)) {
        router.push("/")
      }
    }
  }, [pathname, router])

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>
  }

  if (!isAuthenticated && pathname !== "/register" && pathname !== "/login") {
    return null
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

