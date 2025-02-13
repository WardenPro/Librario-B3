"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

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
    </div>
  )
}

