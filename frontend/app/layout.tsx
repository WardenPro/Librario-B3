import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeProvider from "./components/ThemeProvider"
import AuthWrapper from "./components/AuthWrapper"
import { LibraryProvider } from "./components/LibraryContext"
import { DisconnectAfterRevocationWrapper } from "./components/DisconnectAfterRevocation"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DisconnectAfterRevocationWrapper>
            <LibraryProvider>
              <AuthWrapper>{children}</AuthWrapper>
            </LibraryProvider>
          </DisconnectAfterRevocationWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'