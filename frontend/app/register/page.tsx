"use client"
import RegisterForm from "./RegisterForm"
import { useLibrary } from "../components/LibraryContext"

export default function RegisterPage() {
  const { libraryName } = useLibrary()
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="p-8 bg-card text-card-foreground rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Inscription à {libraryName}</h1>
        <RegisterForm />
      </div>
    </div>
  )
}

