"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

type BookStats = {
  title: string
  reservations: number
}

type UserStats = {
  name: string
  booksRead: number
}

export default function StatsClient() {
  const [bookStats, setBookStats] = useState<BookStats[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])

  useEffect(() => {
    // Simuler un appel API pour obtenir les statistiques
    const fetchStats = () => {
      // Dans un cas réel, cela serait un appel API
      const bookData: BookStats[] = [
        { title: "Le Petit Prince", reservations: 50 },
        { title: "1984", reservations: 45 },
        { title: "Dune", reservations: 40 },
        { title: "L'Étranger", reservations: 35 },
        { title: "Harry Potter", reservations: 60 },
      ]
      const userData: UserStats[] = [
        { name: "Alice", booksRead: 20 },
        { name: "Bob", booksRead: 15 },
        { name: "Claire", booksRead: 25 },
        { name: "David", booksRead: 18 },
        { name: "Emma", booksRead: 30 },
      ]
      setBookStats(bookData)
      setUserStats(userData)
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Livres les plus réservés</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reservations" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs les plus actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="booksRead" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

