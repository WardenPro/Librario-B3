"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Users, Calendar, Star, BarChart2, Settings, LogOut, Clock, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useLibrary } from "../components/LibraryContext";

const adminNavItems = [
  { href: "/reservations", icon: Calendar, label: "Réservations" },
  { href: "/books", icon: Book, label: "Livres" },
  { href: "/users", icon: Users, label: "Utilisateurs" },
  { href: "/reviews", icon: Star, label: "Évaluations" },
  { href: "/stats", icon: BarChart2, label: "Statistiques" },
  { href: "/settings", icon: Settings, label: "Paramètres" }
]

const userNavItems = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/history", icon: Clock, label: "Historique" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const { libraryName } = useLibrary();

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const navItems = userRole === "admin" ? adminNavItems : userNavItems

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-8 text-center">{libraryName}</h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}

