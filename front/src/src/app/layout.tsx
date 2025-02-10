import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeProvider from "./components/ThemeProvider"
import AuthWrapper from "./components/AuthWrapper"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WardenPro Librario",
  description: "Système de gestion de bibliothèque moderne",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}

