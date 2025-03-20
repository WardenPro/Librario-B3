"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const CheckUserId = (token: string) => {
    try {
      const payload = token.split(".")[1]
      const decodedPayload = window.atob(payload)
      const userId = JSON.parse(decodedPayload).user_id
      return userId
    } catch (error) {
      console.error("⚠️ Erreur lors de la vérification de l'ID utilisateur :", error)
      return error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          bio,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (err) {
        throw new Error("Réponse invalide du serveur.")
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token)
        const id = CheckUserId(data.token)
        localStorage.setItem("userRole", "user")
      }

      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      })

      router.push("/")
    } catch (error: any) {
      console.error("⚠️ Erreur d'inscription :", error.message)

      setErrorMessage(error.message)

      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur inconnue est survenue.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="bio">Bio (optionnel)</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="resize-none" rows={3} />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Inscription en cours..." : "S'inscrire"}
      </Button>

      {errorMessage && <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>}
    </form>
  )
}

