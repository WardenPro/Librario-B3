"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Check } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("") // State pour afficher l'erreur
  const router = useRouter()
  const { toast } = useToast()

  // Fonction pour vérifier le rôle de l'utilisateur
  const CheckUserRole = (token: string) => {
    const payload = token.split(".")[1]
    const decodedPayload = atob(payload)
    const userRole = JSON.parse(decodedPayload).role
    return userRole === "admin"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("") // Réinitialise les erreurs

    try {
      console.log("🔄 Tentative de connexion...")

      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📡 Réponse API reçue :", response.status)

      let data;
      try {
        data = await response.json()
      } catch (err) {
        throw new Error("Réponse invalide du serveur.")
      }

      console.log("✅ Données JSON :", data)

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`)
      }

      localStorage.setItem("auth_token", data.token)
      console.log("🔑 Token JWT stocké :", data.token)
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })

      if (CheckUserRole(data.token)) {
        localStorage.setItem("userRole", "admin")
        router.push("/reservations")
      } else {
        localStorage.setItem("userRole", "user")
        router.push("/")
      }
    } catch (error: any) {
      console.error("⚠️ Erreur de connexion :", error.message)

      setErrorMessage(error.message) // Affichage de l'erreur dans l'UI

      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur inconnue est survenue.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Connexion en cours..." : "Se connecter"}
      </Button>

      {/* Affichage du message d'erreur sous le bouton */}
      {errorMessage && (
        <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>
      )}
    </form>
  )
}
