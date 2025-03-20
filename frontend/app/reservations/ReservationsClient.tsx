"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations", {
          method: "GET",
          headers: {
            "auth_token": `${localStorage.getItem("auth_token")}`,
          },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération des réservations");

        const data: Reservation[] = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    };

    fetchReservations();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy", { locale: fr });
  };

  const handleClaimStatusChange = async (copyId: number, isClaimed: boolean) => {
    const route = isClaimed ? `/api/copy/${copyId}/claimed` : `/api/copy/${copyId}/unclaimed`;

    try {
      const response = await fetch(route, {
        method: "PUT",
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Échec de la mise à jour du statut");

      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.copy_id === copyId ? { ...reservation, is_claimed: isClaimed } : reservation
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  const handleDeleteReservation = async (id: number) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "auth_token": `${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression de la réservation");

      setReservations((prevReservations) => prevReservations.filter((reservation) => reservation.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

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
              <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
              <TableCell>{formatDate(reservation.final_date)}</TableCell>
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
                <Button variant="ghost" size="icon" onClick={() => handleDeleteReservation(reservation.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
