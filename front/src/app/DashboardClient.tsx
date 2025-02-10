"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Users, Calendar, Star } from "lucide-react"
import { useState, useEffect } from "react"

type DashboardData = {
  totalBooks: number
  activeUsers: number
  currentReservations: number
  averageRating: number
}

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBooks: 0,
    activeUsers: 0,
    currentReservations: 0,
    averageRating: 0,
  })

  useEffect(() => {
    // Simuler un appel API pour obtenir les données du tableau de bord
    const fetchDashboardData = () => {
      // Dans un cas réel, cela serait un appel API
      const data: DashboardData = {
        totalBooks: 1234,
        activeUsers: 567,
        currentReservations: 89,
        averageRating: 4.7,
      }
      setDashboardData(data)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des livres</CardTitle>
          <Book className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.totalBooks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.activeUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Réservations en cours</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.currentReservations}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboardData.averageRating.toFixed(1)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

