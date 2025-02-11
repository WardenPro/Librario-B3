"use client"

import { useState } from "react"
import { Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Reservation = {
  id: number
  userId: number
  bookId: number
  startDate: string
  endDate: string
  status: "pending" | "active" | "completed" | "cancelled"
}

const reservationsData: Reservation[] = [
  { id: 1, userId: 1, bookId: 1, startDate: "2023-06-01", endDate: "2023-06-15", status: "active" },
  { id: 2, userId: 2, bookId: 2, startDate: "2023-06-05", endDate: "2023-06-19", status: "pending" },
  { id: 3, userId: 3, bookId: 3, startDate: "2023-05-20", endDate: "2023-06-03", status: "completed" },
]

export default function ReservationsClient() {
  const [reservations, setReservations] = useState<Reservation[]>(reservationsData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)

  const handleAddReservation = (newReservation: Omit<Reservation, "id">) => {
    setReservations([...reservations, { ...newReservation, id: reservations.length + 1 }])
    setIsDialogOpen(false)
  }

  const handleEditReservation = (updatedReservation: Reservation) => {
    setReservations(
      reservations.map((reservation) => (reservation.id === updatedReservation.id ? updatedReservation : reservation)),
    )
    setIsDialogOpen(false)
  }

  const handleDeleteReservation = (id: number) => {
    setReservations(reservations.filter((reservation) => reservation.id !== id))
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setCurrentReservation(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter une réservation
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Utilisateur</TableHead>
            <TableHead>ID Livre</TableHead>
            <TableHead>Date de début</TableHead>
            <TableHead>Date de fin</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.userId}</TableCell>
              <TableCell>{reservation.bookId}</TableCell>
              <TableCell>{reservation.startDate}</TableCell>
              <TableCell>{reservation.endDate}</TableCell>
              <TableCell>{reservation.status}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentReservation(reservation)
                    setIsDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReservation(reservation.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentReservation ? "Modifier la réservation" : "Ajouter une réservation"}</DialogTitle>
            <DialogDescription>
              {currentReservation
                ? "Modifiez les détails de la réservation ici."
                : "Entrez les détails de la nouvelle réservation ici."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const reservationData = {
                userId: Number.parseInt(formData.get("userId") as string, 10),
                bookId: Number.parseInt(formData.get("bookId") as string, 10),
                startDate: formData.get("startDate") as string,
                endDate: formData.get("endDate") as string,
                status: formData.get("status") as "pending" | "active" | "completed" | "cancelled",
              }
              if (currentReservation) {
                handleEditReservation({ ...reservationData, id: currentReservation.id })
              } else {
                handleAddReservation(reservationData)
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  ID Utilisateur
                </Label>
                <Input
                  id="userId"
                  name="userId"
                  type="number"
                  defaultValue={currentReservation?.userId}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bookId" className="text-right">
                  ID Livre
                </Label>
                <Input
                  id="bookId"
                  name="bookId"
                  type="number"
                  defaultValue={currentReservation?.bookId}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={currentReservation?.startDate}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={currentReservation?.endDate}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Statut
                </Label>
                <Select name="status" defaultValue={currentReservation?.status || "pending"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                    <SelectItem value="cancelled">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">{currentReservation ? "Modifier" : "Ajouter"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

