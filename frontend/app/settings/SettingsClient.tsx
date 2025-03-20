"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { CheckUserId } from "../login/LoginForm"

export default function SettingsClient() {
  const [libraryName, setLibraryName] = useState("WardenPro Librario")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      const newName = libraryName.trim();

      const ResUserRole = await fetch("/api/library/name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "auth_token": localStorage.getItem("auth_token") || "",
        },
        body: JSON.stringify({ newName }),
      });

      if (!ResUserRole.ok) {
        const errorData = await ResUserRole.json();
        throw new Error(errorData.message || "Échec de la mise à jour.");
      }

      setLibraryName(newName);

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos modifications ont été enregistrées avec succès.",
      });

    } catch (error) {
      console.error("⚠️ Erreur lors de la sauvegarde des paramètres :", error);

      toast({
        title: "Erreur",
        description: "Une erreur inconnue est survenue.",
        variant: "destructive",
      });
    }
  }

  const handleLogoutAllDevices = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Aucun token trouvé")
      }

      const userId = CheckUserId(token)

      const response = await fetch(`/api/logout/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth_token": token
        }
      })

      if (!response.ok) {
        throw new Error("Échec de la déconnexion")
      }

      toast({
        title: "Déconnexion réussie",
        description: "Tous les appareils ont été déconnectés avec succès.",
      });

    } catch (error) {
      console.error("⚠️ Erreur lors de la déconnexion :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="libraryName">Nom de la bibliothèque</Label>
        <Input id="libraryName" value={libraryName} onChange={(e) => setLibraryName(e.target.value)} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
        <Label htmlFor="emailNotifications">Activer les notifications par email</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="darkMode" checked={darkMode} onCheckedChange={setDarkMode} />
        <Label htmlFor="darkMode">Mode sombre</Label>
      </div>

      <Button onClick={handleSave}>Enregistrer les modifications</Button>

      <Button
        variant="destructive"
        onClick={handleLogoutAllDevices}
        className="w-full"
      >
        Déconnecter tous les appareils
      </Button>
    </div>
  )
}
