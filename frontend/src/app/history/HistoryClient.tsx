"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Reservation = {
  id: number
  bookTitle: string
  reservationDate: string
  returnDate: string | null
  status: "En cours" | "Terminée" | "Annulée"
}

const reservationsData: Reservation[] = [
  { id: 1, bookTitle: "Le Petit Prince", reservationDate: "2023-05-01", returnDate: "2023-05-15", status: "Terminée" },
  { id: 2, bookTitle: "1984", reservationDate: "2023-06-01", returnDate: null, status: "En cours" },
  { id: 3, bookTitle: "Dune", reservationDate: "2023-04-15", returnDate: "2023-04-30", status: "Terminée" },
  { id: 4, bookTitle: "L'Étranger", reservationDate: "2023-07-01", returnDate: null, status: "Annulée" },
]

export default function HistoryClient() {
  const [reservations, setReservations] = useState<Reservation[]>(reservationsData)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre du livre</TableHead>
          <TableHead>Date de réservation</TableHead>
          <TableHead>Date de retour</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell>{reservation.bookTitle}</TableCell>
            <TableCell>{reservation.reservationDate}</TableCell>
            <TableCell>{reservation.returnDate || "Non retourné"}</TableCell>
            <TableCell>{reservation.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

