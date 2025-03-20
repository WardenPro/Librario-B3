"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiErrorHandler } from "@/app/components/DisconnectAfterRevocation";

type Reservation = {
  id: number;
  user_id: number;
  copy_id: number;
  book_title: string;
  is_claimed: boolean;
  user_first_name: string;
  user_last_name: string;
  reservation_date: string;
  final_date: string;
};

export default function ReservationsClient() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchWithAuth = useApiErrorHandler();


  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetchWithAuth("/api/reservations", {
          method: "GET",
          headers: {
            "auth_token": `${localStorage.getItem("auth_token")}`,
          },
        });
        if (response.ok) {
          const data: Reservation[] = await response.json();
          console.log("Fetched reservations:", data);
          setReservations(data);
        } else {
          console.error("Failed to fetch reservations:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations();
  }, [fetchWithAuth]);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy", { locale: fr });
  };

  const handleClaimStatusChange = async (copyId: number, isClaimed: boolean) => {
    const route = isClaimed ? `/api/copy/${copyId}/claimed` : `/api/copy/${copyId}/unclaimed`;

    try {
      const response = await fetchWithAuth(route, {
        method: "PUT",
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      });
      console.log("reponse :", response);
      if (response.ok) {
        console.log(`Copy ${isClaimed ? "claimed" : "unclaimed"} successfully`);

        setReservations(reservations.map((reservation) => {
          if (reservation.copy_id === copyId) {
            return { ...reservation, is_claimed: isClaimed };
          }
          return reservation;
        }));
      } else {
        console.error("Failed to update claim status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating claim status:", error);
    }
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      const response = await fetchWithAuth(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        setReservations(reservations.filter((reservation) => reservation.id !== id));
        console.log("Reservation deleted successfully.");
      } else {
        console.error("Failed to delete reservation:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Utilisateur</TableHead>
            <TableHead>Nom Utilisateur</TableHead>
            <TableHead>Titre du Livre</TableHead>
            <TableHead>Date de début</TableHead>
            <TableHead>Date de fin</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.user_id}</TableCell>
              <TableCell>{reservation.user_first_name} {reservation.user_last_name}</TableCell>
              <TableCell>{reservation.book_title}</TableCell>
              <TableCell>{reservation.reservation_date}</TableCell>
              <TableCell>{reservation.final_date}</TableCell>
              <TableCell>
                <Select
                  value={reservation.is_claimed ? "claimed" : "unclaimed"}
                  onValueChange={(value) => {
                    const isClaimed = value === "claimed";
                    handleClaimStatusChange(reservation.copy_id, isClaimed);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claimed">Réclamée</SelectItem>
                    <SelectItem value="unclaimed">Non Réclamée</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentReservation(reservation);
                    setIsDialogOpen(true);
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
              {currentReservation ? "Modifiez les détails de la réservation ici." : "Entrez les détails de la nouvelle réservation ici."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const reservationData = {
                user_id: Number.parseInt(formData.get("user_id") as string, 10),
                copy_id: Number.parseInt(formData.get("copy_id") as string, 10),
                book_title: formData.get("book_title") as string,
                user_first_name: formData.get("user_first_name") as string,
                user_last_name: formData.get("user_last_name") as string,
                reservation_date: formData.get("reservation_date") as string,
                final_date: formData.get("final_date") as string,
                is_claimed: formData.get("is_claimed") === "true",
              };
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userName" className="text-right">Username</Label>
                <Input
                  id="userName"
                  name="userName"
                  type="text"
                  defaultValue={`${currentReservation?.user_first_name} ${currentReservation?.user_last_name}`}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="book_title" className="text-right">Nom du Livre</Label>
                <Input
                  id="book_title"
                  name="book_title"
                  type="text"
                  defaultValue={currentReservation?.book_title}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reservation_date" className="text-right">Date de début</Label>
                <Input
                  id="reservation_date"
                  name="reservation_date"
                  type="date"
                  defaultValue={currentReservation?.reservation_date}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="final_date" className="text-right">Date de fin</Label>
                <Input
                  id="final_date"
                  name="final_date"
                  type="date"
                  defaultValue={currentReservation?.final_date}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_claimed" className="text-right">Statut</Label>
                <Select name="is_claimed" defaultValue={currentReservation?.is_claimed ? "true" : "false"}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Réclamée</SelectItem>
                    <SelectItem value="false">Non Réclamée</SelectItem>
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
  );
}
